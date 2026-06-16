const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { generateUniqueSlug } = require("../utils/slugify");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: false, // Optional for Telegram users,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Optional for Telegram users
      minlength: 6,
    },
    telegram: {
      id: { type: Number, unique: true, sparse: true },
      username: String,
      firstName: String,
      lastName: String,
      photoUrl: String,
    },
    roles: {
      type: [String],
      enum: ["freelancer", "client", "admin"],
      default: ["freelancer"],
      validate: {
        validator: function (roles) {
          return roles && roles.length > 0;
        },
        message: 'At least one role is required'
      }
    },
    currentRole: {
      type: String,
      enum: ["freelancer", "client", "admin"],
      default: "freelancer",
    },
    profile: {
      // Basic Information
      firstName: String,
      lastName: String,
      phone: String,
      location: String,
      bio: String,

      // Skills & Expertise
      skills: [String],
      primarySkill: String,
      experienceLevel: String,

      // Experience & Portfolio
      yearsOfExperience: String,
      portfolioUrl: String,
      certifications: [String],
      cvUrl: String,

      // Availability & Rates
      availability: String,
      monthlyRate: String,
      currency: String,
      preferredJobTypes: [String],
      workLocation: String,

      // Social Links
      linkedinUrl: String,
      githubUrl: String,
      websiteUrl: String,

      // Legacy fields for backward compatibility
      linkedin: String,
      github: String,
      portfolio: String,
      experience: String,
      education: String,
      avatar: String,

      // Profile completion tracking
      isProfileComplete: { type: Boolean, default: false },
      profileCompletedAt: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    otp: String,
    otpExpires: Date,
    subscription: {
      planId: {
        type: String,
        enum: ["free", "basic", "premium"],
        default: "free",
      },
      planName: String,
      price: Number,
      currency: {
        type: String,
        default: "ETB",
      },
      subscribedAt: Date,
      expiresAt: Date, // Calculated as subscribedAt + 1 month
      cancelledAt: Date,
      paymentMethod: String,
      paymentReceipt: String,
      status: {
        type: String,
        enum: ["active", "cancelled", "expired", "pending_approval"],
        default: "active",
      },
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

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate unique slug and default SEO fields before saving
userSchema.pre("save", async function (next) {
  if (
    (this.isModified("profile.firstName") || this.isModified("profile.lastName") || !this.slug) &&
    this.profile && (this.profile.firstName || this.profile.lastName)
  ) {
    try {
      const name = `${this.profile.firstName || ""} ${this.profile.lastName || ""}`.trim();
      if (name) {
        this.slug = await generateUniqueSlug(this.constructor, name, "slug", this._id);
      }
      
      // Establish defaults for SEO fields
      if (!this.seo) this.seo = {};
      if (!this.seo.metaTitle) {
        this.seo.metaTitle = `${name || "User"} | Elite Freelancer on HustleX`;
      }
      if (!this.seo.metaDescription) {
        this.seo.metaDescription = this.profile.bio 
          ? this.profile.bio.substring(0, 150)
          : `Hire ${name || "a professional freelancer"} on HustleX. Review portfolio, hourly rates, and certifications.`;
      }
      if (!this.seo.canonicalUrl && this.slug) {
        this.seo.canonicalUrl = `https://hustlex.com/freelancers/${this.slug}`;
      }
    } catch (err) {
      console.warn("⚠️  Slug generation failed (non-critical):", err.message);
      // Don't fail the save because of slug issues
    }
  }
  next();
});

// Virtual for backward compatibility - returns currentRole as role
userSchema.virtual('role').get(function () {
  return this.currentRole;
}).set(function (value) {
  this.currentRole = value;
  // Ensure the role is in the roles array
  if (!this.roles.includes(value)) {
    this.roles.push(value);
  }
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
