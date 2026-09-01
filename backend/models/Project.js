const mongoose = require("mongoose");
const { generateUniqueSlug } = require("../utils/slugify");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
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

projectSchema.index({ slug: 1 });
projectSchema.index({ freelancer: 1 });
projectSchema.index({ title: "text", description: "text" });

projectSchema.pre("save", async function (next) {
  if (this.isModified("title") || !this.slug) {
    try {
      this.slug = await generateUniqueSlug(this.constructor, this.title, "slug", this._id);
      
      if (!this.seo) this.seo = {};
      if (!this.seo.metaTitle) {
        this.seo.metaTitle = `${this.title} | Portfolio Project on HustleX`;
      }
      if (!this.seo.metaDescription) {
        this.seo.metaDescription = this.description 
          ? this.description.replace(/<[^>]*>/g, "").substring(0, 150).trim()
          : `View portfolio project "${this.title}" hosted on HustleX. Review case study, project images, and technologies used.`;
      }
      if (!this.seo.canonicalUrl) {
        this.seo.canonicalUrl = `https://hustlex.com/projects/${this.slug}`;
      }
      if (this.images && this.images.length > 0 && !this.seo.ogImage) {
        this.seo.ogImage = this.images[0];
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
