const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const { getCache, setCache } = require("../middleware/cache");
const {
  generateEmbedding,
  buildJobEmbeddingInput,
  buildUserEmbeddingInput,
  scoreJobForUser,
} = require("../services/embeddings");

const cacheTTL = 300; // 5 minutes

async function getUserVector(user) {
  const profile = user.profile || {};
  if (
    Array.isArray(profile.cvEmbedding) &&
    profile.cvEmbedding.length > 0
  ) {
    return profile.cvEmbedding;
  }

  const text = buildUserEmbeddingInput({
    cvText: profile.cvText,
    skills: profile.skills,
    primarySkill: profile.primarySkill,
    bio: profile.bio,
  });
  if (!text) return null;

  try {
    const vector = await generateEmbedding(text);
    if (vector && Array.isArray(vector) && vector.length > 0) {
      // Save for subsequent fast matches
      User.updateOne(
        { _id: user._id },
        { $set: { "profile.cvEmbedding": vector } }
      ).catch(() => {});
    }
    return vector;
  } catch (err) {
    console.error("Failed to generate user embedding:", err.message);
    return null;
  }
}

// ================================
// @route   GET /api/recommendations/jobs
// @desc    Recommend jobs for the logged-in freelancer
// @access  Private
// ================================
router.get("/jobs", auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
    const userId = req.user._id.toString();
    const shouldRefresh = req.query.refresh === "true";

    const cacheKey = `recommendations:jobs:${userId}`;
    if (!shouldRefresh) {
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    const profile = req.user.profile || {};
    const userSkills = Array.isArray(profile.skills) ? profile.skills : [];
    const userVector = await getUserVector(req.user);

    if (!userVector && userSkills.length === 0) {
      return res.json({
        recommendations: [],
        total: 0,
        message:
          "Upload a CV or add skills to your profile to get personalized AI job recommendations.",
      });
    }

    // Exclude jobs the user already applied to
    const appliedJobs = await Application.find({ applicant: req.user._id })
      .distinct("job");
    const appliedSet = new Set(appliedJobs.map((id) => id.toString()));

    const jobs = await Job.find({
      isActive: true,
      approved: true,
      _id: { $nin: Array.from(appliedSet) },
    })
      .populate("postedBy", "email profile")
      .sort({ createdAt: -1 })
      .limit(200);

    const scored = [];

    for (const job of jobs) {
      // If job lacks embedding, generate it on the fly using our instant Word2Vec service
      if (!Array.isArray(job.embedding) || job.embedding.length === 0) {
        const input = buildJobEmbeddingInput(job);
        if (input) {
          const vector = await generateEmbedding(input);
          if (vector) {
            job.embedding = vector;
            Job.updateOne({ _id: job._id }, { $set: { embedding: vector, embeddingVersion: 1 } }).catch(() => {});
          }
        }
      }

      const s = await scoreJobForUser(job, userVector, userSkills);

      if (s.score > 0 || (job.skills && job.skills.length > 0)) {
        const jobObj = job.toObject();
        delete jobObj.embedding;
        delete jobObj.embeddingVersion;

        scored.push({
          job: jobObj,
          score: s.score,
          matchScore: s.score,
          semanticSimilarity: s.semanticSimilarity,
          skillSimilarity: s.skillSimilarity,
          matchedSkills: s.matchedSkills || [],
          missingSkills: s.missingSkills || [],
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const recommendations = scored.slice(0, limit);

    const payload = {
      recommendations,
      total: recommendations.length,
      model: "Word2Vec + Semantic Transformer",
      profileVectorized: !!userVector,
      hasCv: !!(profile.cvText && profile.cvUrl),
    };

    await setCache(cacheKey, payload, cacheTTL);

    res.json(payload);
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ message: "Server error generating recommendations" });
  }
});

// ================================
// @route   GET /api/recommendations/match/:jobId
// @desc    Get detailed AI match analysis for a single job against current user
// @access  Private
// ================================
router.get("/match/:jobId", auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).populate("postedBy", "email profile");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const profile = req.user.profile || {};
    const userSkills = Array.isArray(profile.skills) ? profile.skills : [];
    const userVector = await getUserVector(req.user);

    // If job lacks embedding, generate it on the fly
    if (!Array.isArray(job.embedding) || job.embedding.length === 0) {
      const input = buildJobEmbeddingInput(job);
      if (input) {
        const vector = await generateEmbedding(input);
        if (vector) {
          job.embedding = vector;
          Job.updateOne({ _id: job._id }, { $set: { embedding: vector, embeddingVersion: 1 } }).catch(() => {});
        }
      }
    }

    const s = await scoreJobForUser(job, userVector, userSkills);

    let recommendationReason = "";
    if (s.score >= 80) {
      recommendationReason = "🔥 Outstanding match! Your CV experience and core skill set closely match the requirements of this job.";
    } else if (s.score >= 60) {
      recommendationReason = "⚡ Strong match! You possess relevant background. Consider highlighting your matching skills in your proposal.";
    } else if (s.score >= 40) {
      recommendationReason = "💡 Moderate match. Highlight any transferable experience or related projects to stand out.";
    } else {
      recommendationReason = "ℹ️ Low match. You may want to review the required skills before submitting a proposal.";
    }

    res.json({
      jobId: job._id,
      matchScore: s.score,
      semanticSimilarity: s.semanticSimilarity,
      skillSimilarity: s.skillSimilarity,
      matchedSkills: s.matchedSkills || [],
      missingSkills: s.missingSkills || [],
      recommendation: recommendationReason,
      hasCV: !!(profile.cvText && profile.cvUrl),
      hasSkills: userSkills.length > 0,
      skillsCount: userSkills.length,
    });
  } catch (error) {
    console.error("Job match analysis error:", error);
    res.status(500).json({ message: "Failed to analyze job match" });
  }
});

// ================================
// @route   GET /api/recommendations/profile-strength
// @desc    Show how strong the user's matching profile is
// @access  Private
// ================================
router.get("/profile-strength", auth, async (req, res) => {
  const profile = req.user.profile || {};
  const hasCV = !!(profile.cvUrl && profile.cvText);
  const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
  const hasEmbedding =
    Array.isArray(profile.cvEmbedding) && profile.cvEmbedding.length > 0;

  const skillsCount = hasSkills ? profile.skills.length : 0;
  let strengthScore = 0;
  if (hasSkills) strengthScore += Math.min(50, skillsCount * 10);
  if (hasCV) strengthScore += 30;
  if (hasEmbedding) strengthScore += 20;

  res.json({
    hasCV,
    hasSkills,
    skillsCount,
    hasEmbedding,
    strengthScore: Math.min(100, strengthScore),
    readyForRecommendations: hasSkills || hasCV,
    message:
      hasSkills && hasCV
        ? "Your profile is fully optimized for AI Word2Vec job recommendations!"
        : hasSkills
        ? "Add a CV to boost semantic vector matching accuracy."
        : "Add skills and upload a CV to unlock AI job recommendations.",
  });
});

module.exports = router;