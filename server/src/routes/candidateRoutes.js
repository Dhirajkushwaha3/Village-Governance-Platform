import express from "express";
import { Candidate } from "../models/Candidate.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

function buildCandidatePayload(data, fallbackContactInfo = "", forceStatus = null) {
  return {
    name: data.name,
    designation: data.designation === "gram_pradhan" ? "gram_pradhan" : "member",
    age: Number(data.age) || undefined,
    mobileNumbers: Array.isArray(data.mobileNumbers) ? data.mobileNumbers.filter(Boolean) : [],
    photo: data.photo || "",
    tagline: data.tagline,
    education: data.education || "",
    experience: data.experience || "",
    promises: Array.isArray(data.promises) ? data.promises.filter(Boolean) : [],
    contactInfo: data.contactInfo || fallbackContactInfo,
    area: data.area || "",
    verificationStatus: forceStatus || (["approved", "pending"].includes(data.verificationStatus) ? data.verificationStatus : "approved")
  };
}

function hasRequiredCandidateFields(data) {
  return Boolean(data.name && data.tagline);
}

function parseVerificationStatus(status) {
  if (["approved", "rejected"].includes(status)) return status;
  return "";
}

router.get("/", async (req, res) => {
  const includePending = req.query.includePending === "true";
  const baseFilter = includePending ? {} : { verificationStatus: "approved" };

  const candidates = await Candidate.find(baseFilter).sort({ createdAt: -1 });
  return res.json(candidates);
});

router.post("/admin-create", authRequired, requireRole("admin"), async (req, res) => {
  if (!hasRequiredCandidateFields(req.body)) {
    return res.status(400).json({ message: "Name and tagline are required" });
  }

  const candidate = await Candidate.create(buildCandidatePayload(req.body));

  return res.status(201).json(candidate);
});

router.post("/register", authRequired, async (req, res) => {
  if (!hasRequiredCandidateFields(req.body)) {
    return res.status(400).json({ message: "Name and tagline are required" });
  }

  const existing = await Candidate.findOne({ user: req.user._id });
  if (existing) {
    return res.status(400).json({ message: "Candidate profile already exists for this account" });
  }

  const candidate = await Candidate.create({
    user: req.user._id,
    ...buildCandidatePayload(req.body, req.user.email, "pending")
  });

  return res.status(201).json(candidate);
});

router.patch("/:id/verify", authRequired, requireRole("admin"), async (req, res) => {
  const nextStatus = parseVerificationStatus(req.body.status);
  if (!nextStatus) {
    return res.status(400).json({ message: "Status must be approved or rejected" });
  }

  const updated = await Candidate.findByIdAndUpdate(
    req.params.id,
    { verificationStatus: nextStatus },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  return res.json(updated);
});

router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const deleted = await Candidate.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  return res.json({ message: "Candidate deleted" });
});

router.post("/compare", async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length < 2 || ids.length > 4) {
    return res.status(400).json({ message: "Select 2 to 4 candidates for comparison" });
  }

  const candidates = await Candidate.find({ _id: { $in: ids }, verificationStatus: "approved" });
  return res.json(candidates);
});

router.get("/:id", async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  return res.json(candidate);
});

export default router;
