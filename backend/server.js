const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./utils/errorHandler");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ── Security Middleware ─────────────────────────────────────────────────────
// Relaxed for debugging 403 errors
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP for debugging
  }),
);
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.get("Origin")}`);
  next();
});

// ── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ───────────────────────────────────────────────────────────
// Disabled for debugging
// const limiter = rateLimit({ ... });
// app.use(limiter);

// ── Database Connection ─────────────────────────────────────────────────────
connectDB();

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api", require("./routes/interestRoutes"));

// ── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Local Connect API is running",
    version: "1.0.0",
  });
});

// ── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
