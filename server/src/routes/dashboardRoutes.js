import express from "express";
import { Complaint } from "../models/Complaint.js";
import { Candidate } from "../models/Candidate.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", authRequired, async (req, res) => {
  const totalComplaints = await Complaint.countDocuments();
  const resolvedComplaints = await Complaint.countDocuments({ status: "resolved" });
  const pendingComplaints = await Complaint.countDocuments({ status: { $in: ["pending", "in_progress", "escalated"] } });
  const activeCandidates = await Candidate.countDocuments({ verificationStatus: "approved" });

  const categories = await Complaint.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const topCategory = categories[0] || null;

  return res.json({
    totalComplaints,
    resolvedComplaints,
    pendingComplaints,
    resolvedRatio: totalComplaints ? Number(((resolvedComplaints / totalComplaints) * 100).toFixed(1)) : 0,
    topCategory,
    categories,
    activeCandidates
  });
});

export default router;
