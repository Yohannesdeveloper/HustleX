const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
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
      enum: ["freelancer", "client"],
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
      status: {
        type: String,
        enum: ["active", "cancelled", "expired", "pending_approval"],
        default: "active",
      },
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
