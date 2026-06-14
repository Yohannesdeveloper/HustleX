const mongoose = require("mongoose");
const { generateUniqueSlug } = require("../utils/slugify");

const skillSchema = new mongoose.Schema(
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

skillSchema.index({ slug: 1 });
skillSchema.index({ name: "text" });

skillSchema.pre("save", async function (next) {
  if (this.isModified("name") || !this.slug) {
    try {
      this.slug = await generateUniqueSlug(this.constructor, this.name, "slug", this._id);
      
      if (!this.seo) this.seo = {};
      if (!this.seo.metaTitle) {
        this.seo.metaTitle = `Hire Best ${this.name} Freelancers | HustleX`;
      }
      if (!this.seo.metaDescription) {
        this.seo.metaDescription = this.description 
          ? this.description.substring(0, 150)
          : `Hire top remote ${this.name} freelancers on HustleX. Review portfolios, rates, and hire verified experts in 24 hours.`;
      }
      if (!this.seo.canonicalUrl) {
        this.seo.canonicalUrl = `https://hustlex.com/skills/${this.slug}`;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("Skill", skillSchema);
