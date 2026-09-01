const mongoose = require("mongoose");
const { generateUniqueSlug } = require("../utils/slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      canonicalUrl: String,
      structuredData: mongoose.Schema.Types.Mixed,
      ogImage: String,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ name: "text" });

categorySchema.pre("save", async function (next) {
  if (this.isModified("name") || !this.slug) {
    try {
      this.slug = await generateUniqueSlug(this.constructor, this.name, "slug", this._id);
      
      if (!this.seo) this.seo = {};
      if (!this.seo.metaTitle) {
        this.seo.metaTitle = `Best Freelance ${this.name} Services | HustleX`;
      }
      if (!this.seo.metaDescription) {
        this.seo.metaDescription = this.description 
          ? this.description.substring(0, 150)
          : `Find top freelance services in ${this.name} on HustleX. Hire experts for your projects with secure payments.`;
      }
      if (!this.seo.canonicalUrl) {
        this.seo.canonicalUrl = `https://hustlex.com/categories/${this.slug}`;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
