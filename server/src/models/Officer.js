import mongoose from "mongoose";

const officerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    officeName: { type: String, default: "", trim: true },
    officeAddress: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    contactDetails: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: true }
  },
  { timestamps: true }
);

officerSchema.index({ name: "text", role: "text", area: "text" });

export const Officer = mongoose.model("Officer", officerSchema);
