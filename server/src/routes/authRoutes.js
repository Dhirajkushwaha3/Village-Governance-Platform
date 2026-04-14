import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { OtpCode } from "../models/OtpCode.js";
import { User } from "../models/User.js";
import { authRequired } from "../middleware/auth.js";
import { generateOtp, getOtpExpiryDate } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/mail.js";

const router = express.Router();


const otpLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  limit: 5,
  message: { message: "Too many requests. Try again later." }
});

const adminLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  message: { message: "Too many admin login attempts. Try again later." }
});

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function makeUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function getAdminEmail() {
  return normalizeEmail(process.env.ADMIN_EMAIL || "admin@village.local");
}

function isValidAdminPassword(inputPassword) {
  const configuredPassword = String(process.env.ADMIN_PASSWORD || "").trim();
  const providedPassword = String(inputPassword || "").trim();
  return Boolean(configuredPassword) && providedPassword === configuredPassword;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

async function saveOtpForEmail(email, otp) {
  const hashedOtp = await bcrypt.hash(otp, 10);

  await OtpCode.findOneAndUpdate(
    { email },
    {
      email,
      otpHash: hashedOtp,
      expiresAt: getOtpExpiryDate(),
      attempts: 0
    },
    { upsert: true, new: true }
  );
}

function getOtpErrorMessage(record) {
  if (!record) return "No OTP for this email";
  if (record.expiresAt.getTime() < Date.now()) return "OTP expired";
  if (record.attempts >= 5) return "Too many attempts";
  return "";
}

router.post("/request-otp", otpLimiter, async (req, res) => {
  try {
    const emailLower = normalizeEmail(req.body.email);
    const adminEmail = getAdminEmail();

    if (!isValidEmail(emailLower)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }

    if (emailLower === adminEmail) {
      return res.json({ message: "Admin login" });
    }

    const otp = generateOtp();
    await saveOtpForEmail(emailLower, otp);
    await sendOtpEmail(emailLower, otp);

    return res.json({ message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to send OTP email"
    });
  }
});

router.post("/admin-login", adminLoginLimiter, async (req, res) => {
  const emailLower = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const adminEmail = getAdminEmail();

  if (emailLower !== adminEmail) {
    return res.status(403).json({ message: "Invalid admin email" });
  }

  if (!isValidAdminPassword(password)) {
    return res.status(401).json({ message: "Invalid admin password" });
  }

  let user = await User.findOne({ email: emailLower });

  if (!user) {
    user = await User.create({
      name: "Admin",
      email: emailLower,
      role: "admin"
    });
  } else {
    user.role = "admin";
    await user.save();
  }

  const token = makeToken(user._id);

  return res.json({
    message: "Admin login successful",
    token,
    user: makeUserResponse(user)
  });
});

router.post("/verify-otp", async (req, res) => {
  try {
    const inputName = String(req.body.name || "").trim();
    const emailLower = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!emailLower || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    if (!isValidEmail(emailLower)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }

    if (!inputName || inputName.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const record = await OtpCode.findOne({ email: emailLower });
    const otpErrorMessage = getOtpErrorMessage(record);

    if (otpErrorMessage === "OTP expired") {
      await OtpCode.deleteOne({ email: emailLower });
      return res.status(400).json({ message: otpErrorMessage });
    }

    if (otpErrorMessage) {
      return res.status(400).json({ message: otpErrorMessage });
    }

    const isValidOtp = await bcrypt.compare(otp, record.otpHash);
    if (!isValidOtp) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Wrong OTP" });
    }

    await OtpCode.deleteOne({ email: emailLower });

    let user = await User.findOne({ email: emailLower });

    if (!user) {
      user = await User.create({
        name: inputName,
        email: emailLower,
        role: "user"
      });
    } else if (user.name !== inputName) {
      user.name = inputName;
      await user.save();
    }

    const token = makeToken(user._id);

    return res.json({
      message: "Login successful",
      token,
      user: makeUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Could not verify OTP"
    });
  }
});

router.get("/me", authRequired, async (req, res) => {
  return res.json({ user: makeUserResponse(req.user) });
});

export default router;
