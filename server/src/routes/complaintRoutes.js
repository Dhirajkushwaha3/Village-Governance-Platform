import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import multer from "multer";
import { Complaint } from "../models/Complaint.js";
import { Officer } from "../models/Officer.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { shouldAllowEscalation } from "../utils/otp.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

function buildComplaintFilter(query) {
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  return filter;
}

function formatComplaint(item) {
  return {
    ...item.toObject(),
    upvoteCount: item.upvotes.length
  };
}

router.get("/", async (req, res) => {
  const filter = buildComplaintFilter(req.query);

  const complaints = await Complaint.find(filter)
    .populate("createdBy", "name role")
    .populate("responses.responder", "name")
    .populate("escalatedTo", "name role area phone email officeName officeAddress contactDetails")
    .sort({ createdAt: -1 });

  const shaped = complaints.map(formatComplaint);

  return res.json(shaped);
});

router.post("/", authRequired, upload.single("image"), async (req, res) => {
  const { title, description, category, location } = req.body;

  if (!title || !description || !category || !location) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  const isDuplicate = await Complaint.findOne({
    createdBy: req.user._id,
    title: title.trim(),
    location: location.trim(),
    createdAt: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) }
  });

  if (isDuplicate) {
    return res.status(409).json({ message: "Similar complaint already submitted recently" });
  }

  const complaint = await Complaint.create({
    title: title.trim(),
    description: description.trim(),
    category,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    location: location.trim(),
    createdBy: req.user._id
  });

  return res.status(201).json(complaint);
});

router.post("/:id/upvote", authRequired, async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  const hasUpvoted = complaint.upvotes.some((id) => String(id) === String(req.user._id));
  if (hasUpvoted) {
    return res.status(400).json({ message: "You already upvoted this complaint" });
  }

  complaint.upvotes.push(req.user._id);
  await complaint.save();

  return res.json({ message: "Upvote added", upvoteCount: complaint.upvotes.length });
});

router.post("/:id/respond", authRequired, requireRole("candidate", "admin"), async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Response message is required" });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  complaint.responses.push({
    responder: req.user._id,
    role: req.user.role,
    message: message.trim()
  });

  await complaint.save();
  return res.json({ message: "Response posted" });
});

router.patch("/:id/status", authRequired, requireRole("admin"), async (req, res) => {
  const { status } = req.body;

  if (!["pending", "in_progress", "resolved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  complaint.status = status;
  await complaint.save();

  return res.json({ message: "Status updated", status: complaint.status });
});

router.post("/:id/escalate", authRequired, async (req, res) => {
  const { officerId } = req.body;
  if (!officerId) {
    return res.status(400).json({ message: "Officer selection is required" });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  if (["resolved", "rejected", "escalated"].includes(complaint.status)) {
    return res.status(400).json({ message: "This complaint cannot be escalated" });
  }

  if (!shouldAllowEscalation(complaint.createdAt)) {
    return res.status(400).json({ message: "Escalation not available yet" });
  }

  const officer = await Officer.findById(officerId);
  if (!officer) {
    return res.status(404).json({ message: "Officer not found" });
  }

  complaint.status = "escalated";
  complaint.escalatedAt = new Date();
  complaint.escalatedTo = officer._id;
  await complaint.save();

  return res.json({ message: "Complaint escalated", officer });
});

export default router;
