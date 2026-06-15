const User = require("../models/User");
const Job = require("../models/Job");

/**
 * Middleware to check if user has active subscription and can post jobs
 * Limits:
 * - Free trial: 3 jobs total (not per month)
 * - Basic (999 ETB): 10 jobs per month
 * - Premium (9,999 ETB): Unlimited jobs per month
 */
const checkSubscriptionForJobPosting = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check subscription status and expiration
    const subscription = user.subscription || {};
    const planId = subscription.planId || "free";
    const status = subscription.status || "active";
    const subscribedAt = subscription.subscribedAt;

    // Check if subscription has expired (30 days from subscription date)
    let isExpired = false;
    if (subscribedAt && planId !== "free") {
      const subscriptionEndDate = new Date(subscribedAt);
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // Add 1 month
      isExpired = new Date() > subscriptionEndDate;
      
      // Update subscription status if expired
      if (isExpired && status === "active") {
        user.subscription.status = "expired";
        await user.save();
      }
    }

    // If subscription is expired or cancelled, check lifetime free trial limit
    if ((status === "expired" || status === "cancelled") && planId !== "free") {
      // Count total jobs posted by user (lifetime)
      const totalJobsCount = await Job.countDocuments({ postedBy: user._id });
      
      // If user has already posted 3 jobs in their lifetime, they cannot post more without renewing
      if (totalJobsCount >= 3) {
        return res.status(403).json({
          message: "Your subscription has expired and you have reached the lifetime limit of 3 job posts. Please renew your subscription to post more jobs.",
          code: "SUBSCRIPTION_EXPIRED_LIFETIME_LIMIT",
          currentPlan: planId,
          totalJobsPosted: totalJobsCount,
          limit: 3,
          isLifetimeLimit: true,
        });
      }
      
      // Allow posting if under 3 jobs lifetime (free trial limit still applies)
      return next();
    }

    // Check job posting limits based on plan
    if (planId === "free") {
      // Free trial: 3 jobs LIFETIME limit (once reached, can never post again without upgrading)
      const totalJobsCount = await Job.countDocuments({ postedBy: user._id });
      
      if (totalJobsCount >= 3) {
        return res.status(403).json({
          message: "You have reached the lifetime free trial limit of 3 job posts. You must upgrade to a paid plan to post any more jobs.",
          code: "FREE_TRIAL_LIFETIME_LIMIT_REACHED",
          currentPlan: planId,
          totalJobsPosted: totalJobsCount,
          limit: 3,
          isLifetimeLimit: true,
        });
      }
    } else if (planId === "basic") {
      // Basic plan: 10 jobs per month
      if (status !== "active" || isExpired) {
        return res.status(403).json({
          message: "Your subscription is not active. Please renew your subscription to post jobs.",
          code: "SUBSCRIPTION_INACTIVE",
          currentPlan: planId,
        });
      }

      // Get current month start date
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Count jobs posted this month
      const monthlyJobsCount = await Job.countDocuments({
        postedBy: user._id,
        createdAt: { $gte: monthStart },
      });

      if (monthlyJobsCount >= 10) {
        return res.status(403).json({
          message: "You have reached your monthly limit of 10 job posts. Upgrade to Premium for unlimited posts.",
          code: "MONTHLY_LIMIT_REACHED",
          currentPlan: planId,
          monthlyJobsPosted: monthlyJobsCount,
          limit: 10,
        });
      }
    } else if (planId === "premium") {
      // Premium plan: Unlimited jobs per month
      if (status !== "active" || isExpired) {
        return res.status(403).json({
          message: "Your subscription is not active. Please renew your subscription to post jobs.",
          code: "SUBSCRIPTION_INACTIVE",
          currentPlan: planId,
        });
      }
      // Premium users can post unlimited jobs, no check needed
    }

    // User can post job
    req.user.subscription = subscription;
    req.user.planId = planId;
    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    res.status(500).json({ message: "Server error while checking subscription" });
  }
};

/**
 * Get user's job posting status and limits
 */
const getUserJobPostingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subscription = user.subscription || {};
    const planId = subscription.planId || "free";
    const status = subscription.status || "active";
    const subscribedAt = subscription.subscribedAt;

    // Check expiration
    let isExpired = false;
    let expiresAt = null;
    if (subscribedAt && planId !== "free") {
      expiresAt = new Date(subscribedAt);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      isExpired = new Date() > expiresAt;
    }

    // Get job counts
    const totalJobsCount = await Job.countDocuments({ postedBy: user._id });
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyJobsCount = await Job.countDocuments({
      postedBy: user._id,
      createdAt: { $gte: monthStart },
    });

    // Determine limits
    let limit = 3; // Free trial default
    let limitType = "total"; // "total" or "monthly"
    let canPost = true;
    let message = "";

    if (planId === "free") {
      limit = 3;
      limitType = "lifetime"; // Changed from "total" to "lifetime" for clarity
      canPost = totalJobsCount < 3;
      if (!canPost) {
        message = "You have reached the lifetime free trial limit of 3 job posts. You must upgrade to a paid plan to post any more jobs.";
      }
    } else if (planId === "basic") {
      limit = 10;
      limitType = "monthly";
      canPost = status === "active" && !isExpired && monthlyJobsCount < 10;
      if (isExpired || status !== "active") {
        message = "Your subscription has expired. Please renew to post jobs.";
        canPost = false;
      } else if (monthlyJobsCount >= 10) {
        message = "You have reached your monthly limit of 10 job posts. Upgrade to Premium for unlimited posts.";
        canPost = false;
      }
    } else if (planId === "premium") {
      limit = -1; // Unlimited
      limitType = "monthly";
      canPost = status === "active" && !isExpired;
      if (isExpired || status !== "active") {
        message = "Your subscription has expired. Please renew to post jobs.";
        canPost = false;
      }
    }

    res.json({
      planId,
      planName: subscription.planName || planId,
      status: isExpired ? "expired" : status,
      isExpired,
      expiresAt,
      subscribedAt,
      canPost,
      message,
      limits: {
        type: limitType,
        limit,
        current: limitType === "total" ? totalJobsCount : monthlyJobsCount,
        remaining: limit === -1 ? -1 : Math.max(0, limit - (limitType === "total" ? totalJobsCount : monthlyJobsCount)),
      },
      stats: {
        totalJobs: totalJobsCount,
        monthlyJobs: monthlyJobsCount,
      },
    });
  } catch (error) {
    console.error("Get job posting status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  checkSubscriptionForJobPosting,
  getUserJobPostingStatus,
};
