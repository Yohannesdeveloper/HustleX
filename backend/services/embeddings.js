/**
 * HustleX AI Recommendation Engine
 * Word-to-Vector & Semantic Embedding Service
 *
 * Combines:
 * 1. Deep-learning sentence transformer (all-MiniLM-L6-v2) via @xenova/transformers
 * 2. High-speed local Word2Vec / Dense Semantic Projection matrix (instant, zero-network-dependency)
 * 3. Domain-specific tech & freelance cluster vectors (Frontend, Backend, AI/ML, Design, Mobile, DevOps, etc.)
 * 4. Cosine similarity & skill overlap scoring with matched/missing skills extraction
 */

let pipeline = null;
let extractor = null;
let modelLoaded = false;
let modelPromise = null;
let modelLoadAttempted = false;

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";
const VECTOR_DIM = 128; // Standard Word2Vec dense vector dimension

// Common English & resume stopwords
const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
  "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
  "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
  "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
  "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
  "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
  "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
  "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
  "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
  "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves", "years", "experience", "work", "job", "responsibilities"
]);

// Semantic Cluster Anchor Vectors (Seed Concept Coordinates for Word2Vec)
const SEMANTIC_CLUSTERS = {
  frontend: [
    "react", "vue", "angular", "html", "css", "tailwind", "nextjs", "redux",
    "svelte", "ui", "ux", "figma", "frontend", "web", "javascript", "typescript",
    "responsive", "bootstrap", "sass", "webpack", "vite", "frontend developer"
  ],
  backend: [
    "node", "nodejs", "express", "python", "django", "flask", "fastapi", "java",
    "spring", "php", "laravel", "golang", "go", "rust", "backend", "api", "rest",
    "graphql", "microservices", "server", "architecture", "c#", "dotnet", "backend developer"
  ],
  database: [
    "mongodb", "postgres", "postgresql", "mysql", "redis", "sqlite", "nosql",
    "sql", "prisma", "mongoose", "database", "orm", "indexing", "cassandra", "dynamodb"
  ],
  mobile: [
    "flutter", "react native", "ios", "android", "swift", "kotlin", "mobile",
    "dart", "react-native", "capacitor", "mobile app", "app development"
  ],
  ai_data: [
    "ai", "artificial intelligence", "machine learning", "ml", "deep learning",
    "nlp", "data science", "tensorflow", "pytorch", "pandas", "numpy", "python",
    "llm", "openai", "scikit-learn", "word2vec", "embeddings", "computer vision",
    "vector", "data analysis", "neural network", "bert", "gpt"
  ],
  devops_cloud: [
    "docker", "kubernetes", "aws", "cloud", "azure", "gcp", "devops", "ci/cd",
    "linux", "nginx", "terraform", "github actions", "deployment", "infrastructure"
  ],
  design_creative: [
    "figma", "photoshop", "illustrator", "ui", "ux", "wireframe", "prototype",
    "graphic design", "video editing", "premiere", "after effects", "3d", "blender",
    "branding", "logo design", "creative"
  ],
  marketing_content: [
    "seo", "copywriting", "content writing", "social media", "marketing", "digital marketing",
    "google ads", "facebook ads", "email marketing", "translation", "content", "content creator"
  ],
  management_qa: [
    "project management", "agile", "scrum", "qa", "testing", "jest", "cypress",
    "leadership", "client communication", "problem solving", "unit testing"
  ]
};

// Deterministic Pseudo-Random Hash for Subword Embedding
function stringToHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate a deterministic unit vector for a given word / seed index
function getWordVector(word, dimension = VECTOR_DIM) {
  const vec = new Float64Array(dimension);
  const cleanWord = word.toLowerCase().trim();

  // Check if word matches any semantic cluster
  let clusterBonus = false;
  let clusterIdx = 0;

  for (const [clusterKey, words] of Object.entries(SEMANTIC_CLUSTERS)) {
    if (words.includes(cleanWord) || words.some(w => cleanWord.includes(w) || w.includes(cleanWord))) {
      clusterBonus = true;
      // Map cluster to specific dimensional subspace
      const clusterOffset = (clusterIdx * 14) % dimension;
      for (let i = 0; i < 14; i++) {
        vec[(clusterOffset + i) % dimension] += 1.8;
      }
    }
    clusterIdx++;
  }

  // Add subword n-gram character contributions
  const ngrams = [];
  const padded = `<${cleanWord}>`;
  for (let n = 3; n <= 4; n++) {
    for (let i = 0; i <= padded.length - n; i++) {
      ngrams.push(padded.slice(i, i + n));
    }
  }

  for (const ngram of ngrams) {
    const h = stringToHash(ngram);
    const idx = h % dimension;
    const sign = (h % 2 === 0) ? 1 : -1;
    vec[idx] += sign * 0.5;
  }

  // Normalize
  let mag = 0;
  for (let i = 0; i < dimension; i++) {
    mag += vec[i] * vec[i];
  }
  mag = Math.sqrt(mag);
  if (mag > 0) {
    for (let i = 0; i < dimension; i++) {
      vec[i] /= mag;
    }
  }

  return vec;
}

// Generate dense Word-to-Vector document embedding
function generateWord2VecEmbedding(text, dimension = VECTOR_DIM) {
  if (!text || typeof text !== "string") return null;

  // Tokenize words
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\- ]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));

  if (tokens.length === 0) return null;

  // Calculate term frequency
  const termFreq = {};
  for (const token of tokens) {
    termFreq[token] = (termFreq[token] || 0) + 1;
  }

  const docVector = new Float64Array(dimension);
  const totalTokens = tokens.length;

  for (const [token, count] of Object.entries(termFreq)) {
    const tf = count / totalTokens;
    // Boost rare/specific technical keywords
    const weight = Math.log(1 + count) * (token.length > 3 ? 1.4 : 1.0);
    const wordVec = getWordVector(token, dimension);

    for (let i = 0; i < dimension; i++) {
      docVector[i] += wordVec[i] * weight;
    }
  }

  // L2 Normalize
  let norm = 0;
  for (let i = 0; i < dimension; i++) {
    norm += docVector[i] * docVector[i];
  }
  norm = Math.sqrt(norm);
  if (norm === 0) return null;

  const result = new Array(dimension);
  for (let i = 0; i < dimension; i++) {
    result[i] = Math.round((docVector[i] / norm) * 10000) / 10000;
  }

  return result;
}

// Optional: Deep Learning transformer pipeline
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

  modelLoadAttempted = true;
  modelPromise = (async () => {
    try {
      const fn = await getPipeline();
      extractor = fn;
      modelLoaded = true;
      console.log("🧠 Deep Learning Embedding Model loaded (all-MiniLM-L6-v2)");
      return extractor;
    } catch (err) {
      console.warn("Notice: Transformers pipeline offline, using native Word2Vec embedding engine.");
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
    .slice(0, 4000)
    .trim();
}

/**
 * Generate semantic vector embedding for any text
 * Uses Transformer model if available, with instantaneous local Word2Vec fallback
 */
async function generateEmbedding(text) {
  const input = preprocessText(text);
  if (!input) return null;

  // Try Transformer if ready
  if (modelLoaded && extractor) {
    try {
      const output = await extractor(input, { pooling: "mean", normalize: true });
      return Array.from(output.data);
    } catch (err) {
      // Fallback
    }
  }

  // Return native Word2Vec vector (instant, robust, works offline)
  return generateWord2VecEmbedding(input);
}

/**
 * Cosine Similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  if (vecA.length === 0 || vecB.length === 0) return 0;

  // Handle vectors of same length
  if (vecA.length === vecB.length) {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }
    if (magA === 0 || magB === 0) return 0;
    const sim = dot / (Math.sqrt(magA) * Math.sqrt(magB));
    return Math.max(0, Math.min(1, sim));
  }

  // In case of dimension mismatch, truncate to smaller or return zero
  const minLen = Math.min(vecA.length, vecB.length);
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < minLen; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return Math.max(0, Math.min(1, dot / (Math.sqrt(magA) * Math.sqrt(magB))));
}

/**
 * Build consolidated text input for job embedding
 */
function buildJobEmbeddingInput(job) {
  const parts = [
    job.title,
    job.description,
    job.category,
    job.jobSector,
    Array.isArray(job.skills) ? job.skills.join(", ") : "",
    Array.isArray(job.requirements) ? job.requirements.join(". ") : "",
  ];
  return parts.filter(Boolean).join("\n");
}

/**
 * Build consolidated text input for user embedding (CV + Skills + Bio)
 */
function buildUserEmbeddingInput({ cvText, skills, primarySkill, bio }) {
  const parts = [
    primarySkill ? `Primary Specialty: ${primarySkill}` : "",
    Array.isArray(skills) && skills.length > 0 ? `Core Skills: ${skills.join(", ")}` : "",
    bio ? `Professional Summary: ${bio}` : "",
    cvText ? `CV / Resume Experience:\n${cvText}` : "",
  ];
  return parts.filter(Boolean).join("\n\n");
}

/**
 * Calculate skill overlap between user and job
 */
function skillOverlap(userSkillList, jobSkillList) {
  const userSkills = new Set((userSkillList || []).map((s) => String(s).toLowerCase().trim()));
  const jobSkills = (jobSkillList || []).map((s) => String(s).trim()).filter(Boolean);

  if (jobSkills.length === 0) {
    return { matched: [], missing: [], score: 0.5 };
  }

  const matched = [];
  const missing = [];

  for (const skill of jobSkills) {
    const sLower = skill.toLowerCase();
    const isMatched = userSkills.has(sLower) || Array.from(userSkills).some(u => u.includes(sLower) || sLower.includes(u));
    if (isMatched) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const score = matched.length / jobSkills.length;
  return { matched, missing, score };
}

/**
 * Score a job against a user's vector and skills
 */
async function scoreJobForUser(job, userVector, userSkillList, options = {}) {
  const jobVector = job.embedding;
  const sim = (jobVector && userVector) ? cosineSimilarity(userVector, jobVector) : 0;

  const { matched, missing, score: skillScore } = skillOverlap(userSkillList, job.skills);

  // Balanced weighting: 65% semantic meaning (Word2Vec / CV context), 35% exact skill overlap
  const semanticWeight = options.semanticWeight ?? 0.65;
  const skillWeight = options.skillWeight ?? 0.35;

  let finalScore;
  if (userVector && jobVector) {
    finalScore = (semanticWeight * sim) + (skillWeight * skillScore);
  } else {
    // If vector not yet computed, fall back gracefully to skill overlap
    finalScore = skillScore;
  }

  const normalizedScore = Math.min(100, Math.max(0, Math.round(finalScore * 100)));

  return {
    score: normalizedScore, // 0 - 100 scale
    matchScore: normalizedScore,
    semanticSimilarity: Math.round(sim * 100) / 100,
    skillSimilarity: Math.round(skillScore * 100) / 100,
    matchedSkills: matched,
    missingSkills: missing,
  };
}

module.exports = {
  generateEmbedding,
  generateWord2VecEmbedding,
  cosineSimilarity,
  buildJobEmbeddingInput,
  buildUserEmbeddingInput,
  skillOverlap,
  scoreJobForUser,
  getExtractor,
  isModelReady: () => modelLoaded,
};