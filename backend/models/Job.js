const mongoose = require("mongoose");

// Helper to safely parse array
const safeParseArray = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          const vals = Object.values(item).filter((v) => typeof v === 'string');
          return vals;
        }
        return String(item);
      })
      .flat()
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return safeParseArray(parsed);
    } catch {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const jobSchema = new mongoose.Schema(
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
    company: {
      type: String,
      trim: true,
    },
    budget: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    jobSector: {
      type: String,
      trim: true,
    },
    jobSite: {
      type: String,
      trim: true,
    },
    compensationType: {
      type: String,
      trim: true,
    },
    jobType: {
      type: String, // removed enum to accept any string
    },
    workLocation: {
      type: String, // removed enum to accept any string
    },
    experience: {
      type: String, // removed enum to accept any string
    },
    education: {
      type: String,
      default: "Not specified",
    },
    gender: {
      type: String,
      default: "Any",
    },
    vacancies: {
      type: Number,
      default: 1,
    },
    skills: {
      type: [String],
      set: safeParseArray,
      default: [],
    },
    requirements: {
      type: [String],
      set: safeParseArray,
      default: [],
    },
    benefits: {
      type: [String],
      set: safeParseArray,
      default: [],
    },
    contactEmail: String,
    contactPhone: String,
    companyWebsite: String,
    deadline: String,
    visibility: {
      type: String, // removed enum to accept any string
      default: "public",
    },
    jobLink: String,
    address: String,
    country: String, // now allows any string including null
    city: String,
    approved: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String, // removed enum to accept any string
      default: "active",
    },
    applicants: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
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

// Index for better search performance
jobSchema.index({ title: "text", description: "text", company: "text" });
jobSchema.index({ category: 1, isActive: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ slug: 1 });

// Generate unique slug and default SEO fields before saving
const { generateUniqueSlug } = require("../utils/slugify");
jobSchema.pre("save", async function (next) {
  if (this.isModified("title") || this.isModified("company") || !this.slug) {
    try {
      const baseString = `${this.title} at ${this.company || "HustleX"}`;
      this.slug = await generateUniqueSlug(this.constructor, baseString, "slug", this._id);
      
      // Establish defaults for SEO fields
      if (!this.seo) this.seo = {};
      if (!this.seo.metaTitle) {
        this.seo.metaTitle = `${this.title} Job at ${this.company || "HustleX"} | HustleX`;
      }
      if (!this.seo.metaDescription) {
        this.seo.metaDescription = this.description 
          ? this.description.replace(/<[^>]*>/g, "").substring(0, 150).trim()
          : `Apply to the ${this.title} remote/contract job at ${this.company || "HustleX"} on HustleX. Budget: ${this.budget}. Apply now!`;
      }
      if (!this.seo.canonicalUrl) {
        this.seo.canonicalUrl = `https://hustlex.com/jobs/${this.slug}`;
      }
    } catch (err) {
      console.warn("⚠️ Slug/SEO generation failed, skipping:", err.message);
    }
  }
  next();
});

module.exports = mongoose.model("Job", jobSchema);
