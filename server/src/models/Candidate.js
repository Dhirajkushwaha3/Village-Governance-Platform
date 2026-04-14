import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      enum: ["gram_pradhan", "member"],
      default: "member"
    },
    age: {
      type: Number,
      min: 21,
      max: 100
    },
    mobileNumbers: {
      type: [String],
      default: []
    },
    photo: {
      type: String,
      default: ""
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    education: {
      type: String,
      default: ""
    },
    experience: {
      type: String,
      default: ""
    },
    promises: {
      type: [String],
      default: []
    },
    contactInfo: {
      type: String,
      default: ""
    },
    area: {
      type: String,
      default: ""
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

candidateSchema.index({ verificationStatus: 1, designation: 1 });

export const Candidate = mongoose.model("Candidate", candidateSchema);
