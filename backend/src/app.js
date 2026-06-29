const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const app = express();

// ── Security headers
app.use(helmet());

// ── CORS — allow your frontend origin; update FRONTEND_URL in .env for production
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, Postman, same-host)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true); // dev fallback
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ── Webhook route MUST come before express.json() so raw body is preserved
app.use("/api/webhook", webhookRoutes);

// ── Body parsing
app.use(express.json());
app.use(morgan("dev"));

// ── Global rate limit (300 req / 15 min per IP)
const globalLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use(globalLimit);

// ── Auth rate limit (stricter)
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many auth attempts, please try again later." },
});

// ── Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "d-ranky-backend" });
});

// ── Routes
app.use("/api/auth", authLimit, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// ── 404 catch-all
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// ── Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error." });
});

module.exports = app;
