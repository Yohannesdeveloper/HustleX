const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");

// Pricing plans configuration
const PRICING_PLANS = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    currency: "ETB",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Post up to 3 jobs (lifetime limit)",
      "Multi-platform posting",
      "Browse freelancer profiles",
      "Basic messaging",
      "Standard support",
      "Access to job listings",
    ],
    limitations: [],
  },
  {
    id: "basic",
    name: "Basic Plan",
    price: 999,
    currency: "ETB",
    period: "per month",
    description: "For growing businesses",
    features: [
      "Post up to 10 jobs per month",
      "Multi-platform posting",
      "Unlimited freelancer browsing",
      "Priority messaging",
      "Priority support",
      "Advanced search filters",
      "Job analytics dashboard",
      "Featured job listings",
    ],
    limitations: [],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 9999,
    currency: "ETB",
    period: "per month",
    description: "For enterprise needs",
    features: [
      "Unlimited job posts",
      "Multi-platform posting",
      "Unlimited freelancer access",
      "Premium messaging & video calls",
      "24/7 dedicated support",
      "Advanced analytics & insights",
      "Featured & promoted listings",
      "Custom branding options",
      "API access",
      "Dedicated account manager",
      "Early access to new features",
    ],
    limitations: [],
  },
];

// ================================
// @route   GET /api/pricing/plans
// @desc    Get all pricing plans
// @access  Public
// ================================
router.get("/plans", (req, res) => {
  try {
    res.json({ plans: PRICING_PLANS });
  } catch (error) {
    console.error("Pricing plans error:", error);
    res.status(500).json({ message: "Failed to fetch pricing plans", error: error.message });
  }
});

// ================================
// @route   GET /api/pricing/plans/:planId
// @desc    Get single pricing plan
// @access  Public
// ================================
router.get("/plans/:planId", (req, res) => {
  try {
    const { planId } = req.params;
    const plan = PRICING_PLANS.find((p) => p.id === planId);

    if (!plan) {
      return res.status(404).json({ message: "Pricing plan not found" });
    }

    res.json({ plan });
  } catch (error) {
    console.error("Pricing plan error:", error);
    res.status(500).json({ message: "Failed to fetch pricing plan", error: error.message });
  }
});

// ================================
// @route   POST /api/pricing/subscribe
// @desc    Subscribe to a pricing plan
// @access  Private
// ================================
router.post("/subscribe", auth, async (req, res) => {
  try {
    const { planId, paymentMethod } = req.body;
    const User = require("../models/User");

    // Validate plan
    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid pricing plan" });
    }

    // Update user subscription
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine status based on payment method
    // If Telebirr, CBE, or Awash (manual/mobile payment), set to pending_approval
    let status = "active";
    const manualMethods = ["telebirr", "cbe", "awash"];
    if (manualMethods.includes(paymentMethod)) {
      status = "pending_approval";
    }

    // Calculate expiration date (1 month from now for paid plans)
    const subscribedAt = new Date();
    const expiresAt = plan.id !== "free" ? new Date(subscribedAt) : null;
    if (expiresAt) {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Store subscription info
    user.subscription = {
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      currency: plan.currency,
      subscribedAt: subscribedAt,
      expiresAt: expiresAt,
      paymentMethod: paymentMethod || "card",
      status: status,
    };

    await user.save();

    res.json({
      message: status === "pending_approval" ? "Subscription pending approval" : "Subscription successful",
      subscription: user.subscription,
      plan: plan,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ message: "Failed to process subscription", error: error.message });
  }
});

// ================================
// @route   GET /api/pricing/subscription
// @desc    Get user's current subscription
// @access  Private
// ================================
router.get("/subscription", auth, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user._id).select("subscription");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subscription = user.subscription || { planId: "free" };
    const plan = PRICING_PLANS.find((p) => p.id === subscription.planId) || PRICING_PLANS[0];

    res.json({
      subscription: subscription,
      plan: plan,
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ message: "Failed to fetch subscription", error: error.message });
  }
});

// ================================
// @route   POST /api/pricing/send-payment-request
// @desc    Send Santim Pay payment request to phone number
// @access  Private
// ================================
router.post("/send-payment-request", auth, async (req, res) => {
  try {
    const { phoneNumber, planId, amount, currency } = req.body;
    const User = require("../models/User");

    // Validate inputs
    if (!phoneNumber || !planId) {
      return res.status(400).json({ message: "Phone number and plan ID are required" });
    }

    // Validate phone number format (Ethiopian format: 09XXXXXXXX)
    if (!/^09\d{8}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format. Use 09XXXXXXXX" });
    }

    // Validate plan
    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid pricing plan" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate transaction ID
    const transactionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const merchantId = process.env.SANTIM_PAY_MERCHANT_ID || "5063";

    // In production, you would integrate with Santim Pay API to send payment request
    // For now, we'll simulate it and store the pending payment
    const paymentRequest = {
      transactionId,
      phoneNumber,
      planId,
      amount: amount || plan.price,
      currency: currency || plan.currency,
      merchantId,
      userId: user._id,
      status: "pending",
      createdAt: new Date(),
    };

    // Store payment request (in production, you'd use a PaymentRequest model)
    // For now, we'll store it in user's session or a temporary storage
    // In production: await PaymentRequest.create(paymentRequest);

    // Simulate sending payment request via Santim Pay API
    // In production, you would call Santim Pay API:
    /*
    const santimPayResponse = await axios.post('https://santimpay.com/api/send-payment-request', {
      merchant_id: merchantId,
      phone_number: phoneNumber,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      transaction_id: transactionId,
      callback_url: `${process.env.BASE_URL}/api/pricing/payment-callback`,
    });
    */

    // For now, return success (in production, return actual Santim Pay response)
    res.json({
      message: "Payment request sent successfully",
      transactionId,
      phoneNumber,
      merchantId,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      instructions: `A payment request has been sent to ${phoneNumber}. Please check your phone and enter your PIN to confirm the payment.`,
    });
  } catch (error) {
    console.error("Send payment request error:", error);
    res.status(500).json({ message: "Failed to send payment request", error: error.message });
  }
});

// ================================
// @route   POST /api/pricing/payment-callback
// @desc    Handle payment callback from Santim Pay
// @access  Public (called by Santim Pay)
// ================================
router.post("/payment-callback", async (req, res) => {
  try {
    const { transaction_id, status, phone_number } = req.body;

    // In production, verify the callback signature from Santim Pay
    // For now, we'll process the payment

    if (status === "success" || status === "completed") {
      // Find the payment request by transaction_id
      // In production: const paymentRequest = await PaymentRequest.findOne({ transactionId: transaction_id });

      // Update user subscription
      // This would be handled based on the stored payment request

      res.json({ message: "Payment confirmed", transaction_id });
    } else {
      res.json({ message: "Payment failed", transaction_id });
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    res.status(500).json({ message: "Failed to process payment callback" });
  }
});

// ================================
// @route   POST /api/pricing/cancel
// @desc    Cancel user's subscription
// @access  Private
// ================================
router.post("/cancel", auth, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.subscription) {
      user.subscription.status = "cancelled";
      user.subscription.cancelledAt = new Date();
      await user.save();
    }

    res.json({
      message: "Subscription cancelled successfully",
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ message: "Failed to cancel subscription", error: error.message });
  }
});

// ================================
// @route   GET /api/pricing/admin/pending-subscriptions
// @desc    Get all pending subscriptions (Admin only)
// @access  Private (Admin)
// ================================
router.get("/admin/pending-subscriptions", adminAuth, async (req, res) => {
  try {
    const User = require("../models/User");
    const users = await User.find({ "subscription.status": "pending_approval" })
      .select("email profile subscription createdAt roles");

    res.json({ subscriptions: users });
  } catch (error) {
    console.error("Get pending subscriptions error:", error);
    res.status(500).json({ message: "Failed to fetch pending subscriptions", error: error.message });
  }
});

// ================================
// @route   POST /api/pricing/admin/approve/:userId
// @desc    Approve a pending subscription (Admin only)
// @access  Private (Admin)
// ================================
router.post("/admin/approve/:userId", adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const User = require("../models/User");

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.subscription || user.subscription.status !== "pending_approval") {
      return res.status(400).json({ message: "User does not have a pending subscription" });
    }

    // Approve the subscription
    user.subscription.status = "active";
    // Reset start date to now
    const subscribedAt = new Date();
    user.subscription.subscribedAt = subscribedAt;

    // Reset expiration date
    const plan = PRICING_PLANS.find((p) => p.id === user.subscription.planId);
    if (plan && plan.id !== "free") {
      const expiresAt = new Date(subscribedAt);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      user.subscription.expiresAt = expiresAt;
    }

    await user.save();

    res.json({
      message: "Subscription approved successfully",
      subscription: user.subscription
    });
  } catch (error) {
    console.error("Approve subscription error:", error);
    res.status(500).json({ message: "Failed to approve subscription", error: error.message });
  }
});

// ================================
// @route   POST /api/pricing/admin/reject/:userId
// @desc    Reject a pending subscription (Admin only)
// @access  Private (Admin)
// ================================
router.post("/admin/reject/:userId", adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const User = require("../models/User");

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.subscription || user.subscription.status !== "pending_approval") {
      return res.status(400).json({ message: "User does not have a pending subscription" });
    }

    // Reject the subscription (set to cancelled)
    user.subscription.status = "cancelled";
    user.subscription.cancelledAt = new Date();

    await user.save();

    res.json({
      message: "Subscription rejected",
      subscription: user.subscription
    });
  } catch (error) {
    console.error("Reject subscription error:", error);
    res.status(500).json({ message: "Failed to reject subscription", error: error.message });
  }
});

module.exports = router;

