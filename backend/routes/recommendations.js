const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const Application = require("../models/Application");
const { auth } = require("../middleware/auth");
const { getCache, setCache } = require("../middleware/cache");
const {
  generateEmbedding,
  buildJobEmbeddingInput,
  buildUserEmbeddingInput,
  scoreJobForUser,
} = require("../services/embeddings");

const cacheTTL = 600; // 10 minutes

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
    return await generateEmbedding(text);
  } catch (err) {
    console.error("Failed to generate user embedding:", err.message);
    return null;
  }
}

function keywordScore(job, userSkills) {
  const lowerSkills = userSkills.map((s) => String(s).toLowerCase());
  if (!Array.isArray(job.skills) || job.skills.length === 0) return 0;
  const matchCount = job.skills.filter((s) =>
    lowerSkills.includes(String(s).toLowerCase())
  ).length;
  return matchCount / job.skills.length;
}

// ================================
// @route   GET /api/recommendations/jobs
// @desc    Recommend jobs for the logged-in freelancer
// @access  Private
// ================================
router.get("/jobs", auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const userId = req.user._id.toString();

    const cacheKey = `recommendations:jobs:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const profile = req.user.profile || {};
    const userSkills = Array.isArray(profile.skills) ? profile.skills : [];
    const userVector = await getUserVector(req.user);

    if (!userVector && userSkills.length === 0) {
      return res.json({
        recommendations: [],
        message:
          "Upload a CV or add skills to your profile to get personalized job recommendations.",
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
      let result;
      if (userVector && Array.isArray(job.embedding) && job.embedding.length > 0) {
        const s = await scoreJobForUser(job, userVector, userSkills);
        result = s;
      } else {
        // Fallback: keyword skill overlap only
        result = {
          score: keywordScore(job, userSkills),
          skillSimilarity: keywordScore(job, userSkills),
          semanticSimilarity: 0,
          matchedSkills: (job.skills || []).filter((s) =>
            userSkills.map((u) => u.toLowerCase()).includes(String(s).toLowerCase())
          ),
        };
      }

      if (result.score > 0) {
        const jobObj = job.toObject();
        delete jobObj.embedding;
        delete jobObj.embeddingVersion;
        scored.push({
          job: jobObj,
          score: result.score,
          semanticSimilarity: result.semanticSimilarity,
          skillSimilarity: result.skillSimilarity,
          matchedSkills: result.matchedSkills,
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const recommendations = scored.slice(0, limit);

    // Fire-and-forget: generate embeddings for any job missing one so future calls are semantic
    const missingEmbedding = jobs.filter(
      (j) => !Array.isArray(j.embedding) || j.embedding.length === 0
    );
    if (missingEmbedding.length > 0) {
      embedJobsInBackground(missingEmbedding);
    }

    const payload = { recommendations, total: recommendations.length };
    await setCache(cacheKey, payload, cacheTTL);

    res.json(payload);
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ message: "Server error generating recommendations" });
  }
});

async function embedJobsInBackground(jobs) {
  try {
    const { generateEmbedding } = require("../services/embeddings");
    for (const job of jobs) {
      try {
        const input = buildJobEmbeddingInput(job);
        if (!input) continue;
        const vector = await generateEmbedding(input);
        if (vector) {
          await Job.updateOne(
            { _id: job._id },
            { $set: { embedding: vector, embeddingVersion: 1 } }
          );
        }
      } catch (err) {
        // skip this job, try others
      }
    }
  } catch (err) {
    console.error("Background embedding failed:", err.message);
  }
}

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

  res.json({
    hasCV,
    hasSkills,
    hasEmbedding,
    readyForRecommendations: hasSkills && (hasEmbedding || hasCV),
    message:
      hasSkills && (hasEmbedding || hasCV)
        ? "Your profile is ready for smart job recommendations."
        : "Add skills and upload a CV to unlock smart job recommendations.",
  });
});

module.exports = router;