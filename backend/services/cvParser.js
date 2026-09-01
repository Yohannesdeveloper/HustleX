const { PDFParse, VerbosityLevel } = require("pdf-parse");
const mammoth = require("mammoth");

const MAX_TEXT_LENGTH = 20000;

async function extractTextFromPDF(buffer) {
  const parser = new PDFParse({
    data: buffer,
    verbosity: VerbosityLevel.ERRORS,
  });
  try {
    const result = await parser.getText();
    return result.text || "";
  } finally {
    try {
      await parser.destroy();
    } catch (err) {
      // ignore destroy errors
    }
  }
}

async function extractTextFromDOCX(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

function normalizeText(text) {
  if (!text) return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

function getExtension(originalName) {
  if (!originalName) return "";
  return originalName.split(".").pop().toLowerCase() || "";
}

async function parseCV(fileBuffer, originalName) {
  const ext = getExtension(originalName);
  let rawText = "";

  if (ext === "pdf") {
    rawText = await extractTextFromPDF(fileBuffer);
  } else if (ext === "docx") {
    rawText = await extractTextFromDOCX(fileBuffer);
  } else if (ext === "doc") {
    throw new Error(
      "Legacy .doc files are not supported. Please convert the CV to .docx or PDF."
    );
  } else {
    throw new Error(`Unsupported CV file type: .${ext}`);
  }

  const text = normalizeText(rawText);
  if (text.length < 50) {
    return { text, extracted: false };
  }
  return { text, extracted: true };
}

module.exports = {
  parseCV,
  extractTextFromPDF,
  extractTextFromDOCX,
  normalizeText,
};