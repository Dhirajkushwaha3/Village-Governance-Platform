import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import officerRoutes from "./routes/officerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const serverUploadsPath = path.join(__dirname, "..", "uploads");
const legacyUploadsPath = path.join(process.cwd(), "uploads");
const defaultLocalOrigins = ["http://localhost:5173", "http://localhost:5174"];
const vercelOriginPattern = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i;

app.disable("x-powered-by");

function getAllowedOrigins() {
  const originValues = [process.env.CORS_ORIGIN, process.env.FRONTEND_URL, process.env.CLIENT_URL];

  if (process.env.VERCEL_URL) {
    originValues.push(`https://${process.env.VERCEL_URL}`);
  }

  const origins = originValues
    .flatMap((value) => (value ? value.split(",") : []))
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      try {
        return new URL(item).origin;
      } catch {
        return item.replace(/\/$/, "");
      }
    });

  if (origins.length > 0) {
    return [...new Set(origins)];
  }

  return isProduction ? [] : defaultLocalOrigins;
}

function getTrustProxyValue() {
  const value = String(process.env.TRUST_PROXY || "").trim().toLowerCase();
  if (!value) return false;
  if (value === "true") return true;
  if (value === "false") return false;
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) return numeric;
  return value;
}

function validateRuntimeConfig() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be set");
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
    throw new Error("JWT_SECRET must be set and at least 24 characters long");
  }

  if (isProduction) {
    if (!process.env.ADMIN_PASSWORD) {
      throw new Error("ADMIN_PASSWORD is required in production");
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("EMAIL_USER and EMAIL_PASSWORD are required in production for OTP delivery");
    }

    if (!process.env.CORS_ORIGIN && !process.env.FRONTEND_URL && !process.env.CLIENT_URL && !process.env.VERCEL_URL) {
      console.warn("No frontend origin is configured. Set CORS_ORIGIN or FRONTEND_URL to restrict browser access.");
    }
  }
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 400,
  standardHeaders: true,
  legacyHeaders: false
});

const allowedOrigins = getAllowedOrigins();
const trustProxyValue = getTrustProxyValue();

validateRuntimeConfig();

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (vercelOriginPattern.test(origin)) return true;
  return allowedOrigins.includes(origin);
}

function setupMiddleware() {
  app.set("trust proxy", trustProxyValue);

  app.use(
    cors({
      origin(origin, callback) {
        if (isOriginAllowed(origin)) return callback(null, true);
        return callback(new Error("CORS blocked for this origin"));
      }
    })
  );

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(isProduction ? "combined" : "dev"));
  app.use(apiLimiter);
}

function setupStaticFiles() {
  app.use("/uploads", express.static(serverUploadsPath));

  if (legacyUploadsPath !== serverUploadsPath) {
    app.use("/uploads", express.static(legacyUploadsPath));
  }
}

function setupRoutes() {
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Village Governance API" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/candidates", candidateRoutes);
  app.use("/api/complaints", complaintRoutes);
  app.use("/api/officers", officerRoutes);
  app.use("/api/dashboard", dashboardRoutes);
}

function setupErrorHandlers() {
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use((error, req, res, next) => {
    console.error(error);
    const status = error.status || 500;
    const message = isProduction && status >= 500 ? "Internal server error" : error.message || "Internal server error";

    res.status(status).json({
      message
    });
  });
}

setupMiddleware();
setupStaticFiles();
setupRoutes();
setupErrorHandlers();

const port = Number(process.env.PORT || 5000);

function startServer() {
  const server = app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the old server process and try again.`);
      process.exit(1);
    }

    console.error("Server failed to start", error);
    process.exit(1);
  });
}

connectDB()
  .then(() => {
    startServer();
  })
  .catch((error) => {
    console.error("DB connection failed", error);
    process.exit(1);
  });
