import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    responder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["candidate", "admin"], required: true },
    message: { type: String, required: true, trim: true, maxlength: 500 }
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ["road", "water", "electricity", "sanitation", "health", "education", "other"],
      required: true
    },
    imageUrl: { type: String, default: "" },
    location: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected", "escalated"],
      default: "pending"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    responses: { type: [responseSchema], default: [] },
    escalatedAt: { type: Date },
    escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Officer" }
  },
  { timestamps: true }
);

complaintSchema.index({ category: 1, status: 1, createdAt: -1 });

export const Complaint = mongoose.model("Complaint", complaintSchema);
