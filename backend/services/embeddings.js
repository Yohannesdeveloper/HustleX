let pipeline = null;
let extractor = null;
let modelLoaded = false;
let modelPromise = null;

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

async function getPipeline() {
  if (!pipeline) {
    pipeline = require("@xenova/transformers").pipeline;
  }
  if (!extractor) {
    extractor = await pipeline("feature-extraction", MODEL_ID);
  }
  return extractor;
}

async function getExtractor() {
  if (modelLoaded && extractor) return extractor;
  if (modelPromise) return modelPromise;

  modelPromise = (async () => {
    try {
      const fn = await getPipeline();
      extractor = fn;
      modelLoaded = true;
      console.log("🧠 Embedding model loaded (all-MiniLM-L6-v2)");
      return extractor;
    } catch (err) {
      console.error("Failed to load embedding model:", err.message);
      modelPromise = null;
      throw err;
    }
  })();

  return modelPromise;
}

function preprocessText(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/\s+/g, " ")
    .slice(0, 3000)
    .trim();
}

async function generateEmbedding(text) {
  const input = preprocessText(text);
  if (!input) return null;

  const extractorFn = await getExtractor();
  const output = await extractorFn(input, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function buildJobEmbeddingInput(job) {
  const parts = [
    job.title,
    job.description,
    job.category,
    job.jobSector,
    ...(job.skills || []),
    ...(job.requirements || []),
  ];
  return parts.filter(Boolean).join("\n");
}

function buildUserEmbeddingInput({ cvText, skills, primarySkill, bio }) {
  const parts = [
    cvText,
    bio,
    primarySkill,
    ...(skills || []),
  ];
  return parts.filter(Boolean).join("\n");
}

function skillOverlap(userSkillList, jobSkillList) {
  const userSkills = new Set((userSkillList || []).map((s) => s.toLowerCase()));
  const jobSkills = jobSkillList || [];
  if (jobSkills.length === 0) return { matched: [], score: 0 };

  const matched = jobSkills.filter((s) => userSkills.has(String(s).toLowerCase()));
  const score = matched.length / jobSkills.length;
  return { matched, score };
}

async function scoreJobForUser(job, userVector, userSkillList, options = {}) {
  const jobVector = job.embedding;
  const sim = jobVector ? cosineSimilarity(userVector, jobVector) : 0;

  const { matched, score } = skillOverlap(userSkillList, job.skills);

  const semanticWeight = options.semanticWeight ?? 0.7;
  const skillWeight = options.skillWeight ?? 0.3;

  const finalScore = Math.round(
    (semanticWeight * sim + skillWeight * score) * 100
  ) / 100;

  return {
    score: finalScore,
    semanticSimilarity: Math.round(sim * 10000) / 10000,
    skillSimilarity: Math.round(score * 10000) / 10000,
    matchedSkills: matched,
  };
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  buildJobEmbeddingInput,
  buildUserEmbeddingInput,
  skillOverlap,
  scoreJobForUser,
  getExtractor,
  isModelReady: () => modelLoaded,
};