import express from "express";
import { Officer } from "../models/Officer.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

function addSearchFilterIfProvided(filter, key, value) {
  const text = String(value || "").trim();
  if (text) {
    filter[key] = { $regex: text, $options: "i" };
  }
}

router.get("/", async (req, res) => {
  const { q = "", role = "", area = "" } = req.query;
  const filter = {};

  addSearchFilterIfProvided(filter, "name", q);
  addSearchFilterIfProvided(filter, "role", role);
  addSearchFilterIfProvided(filter, "area", area);

  const officers = await Officer.find(filter).sort({ role: 1, name: 1 });
  return res.json(officers);
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { name, role, contactDetails, area, phone, email, officeName, officeAddress } = req.body;
  if (!name || !role || !area) {
    return res.status(400).json({ message: "All officer fields are required" });
  }

  const officer = await Officer.create({
    name,
    role,
    area,
    officeName: officeName || "",
    officeAddress: officeAddress || "",
    phone: phone || "",
    email: email || "",
    contactDetails: contactDetails || phone || "Not Available"
  });
  return res.status(201).json(officer);
});

router.get("/:id", async (req, res) => {
  const officer = await Officer.findById(req.params.id);
  if (!officer) {
    return res.status(404).json({ message: "Officer not found" });
  }
  return res.json(officer);
});

export default router;
