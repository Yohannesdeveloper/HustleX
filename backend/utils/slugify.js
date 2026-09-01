/**
 * HustleX SEO Slug Utilities
 * Generates URL-safe and unique slugs for MongoDB documents
 */

/**
 * Convert a string into a URL-friendly slug
 * @param {string} text - The input text to slugify
 * @returns {string} - The slugified text
 */
const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
    .replace(/\-\-+/g, "-")         // Replace multiple - with single -
    .replace(/^-+/, "")             // Trim - from start of text
    .replace(/-+$/, "");            // Trim - from end of text
};

/**
 * Generate a unique slug in a collection by checking for collisions
 * @param {object} model - The Mongoose Model
 * @param {string} baseString - The base text (e.g. name or title)
 * @param {string} fieldName - The slug field name (default: 'slug')
 * @param {string} excludeId - Exclude a specific ID from the check (for updates)
 * @returns {Promise<string>} - A unique slug
 */
const generateUniqueSlug = async (model, baseString, fieldName = "slug", excludeId = null) => {
  let baseSlug = slugify(baseString || "item");
  if (!baseSlug) baseSlug = "item";

  let slug = baseSlug;
  let count = 1;
  let exists = true;

  while (exists) {
    const query = { [fieldName]: slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const doc = await model.findOne(query).select("_id").lean();
    if (!doc) {
      exists = false;
    } else {
      slug = `${baseSlug}-${count}`;
      count++;
    }
  }

  return slug;
};

module.exports = {
  slugify,
  generateUniqueSlug,
};
