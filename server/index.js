const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const postRoutes = require("./routes/posts");
const uploadRoutes = require("./routes/uploads");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");
const quizRoutes = require("./routes/quizRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const contactRoutes = require("./routes/contact");
require("./utils/dailyReport");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "Too many messages sent. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many password change attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      frameSrc: ["https://www.google.com"],
    },
  },
}));


// Allow both Render and your domain
const allowedOrigins = new Set([
  "https://immigrationpathwaysconsulting.com",
  "https://www.immigrationpathwaysconsulting.com",
  "https://immigrationresourcehub.onrender.com",

  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    console.error("Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

connectDB();
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());

const DIST = path.join(__dirname, "..", "frontend", "dist");

app.use((req, res, next) => {
  if (req.hostname === "immigrationpathwaysconsulting.com") {
    return res.redirect(301, "https://www.immigrationpathwaysconsulting.com" + req.originalUrl);
  }
  next();
});

// Serve built React app
app.use(express.static(DIST));

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", passwordLimiter, userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/contact", contactLimiter, contactRoutes);

// All non-API routes serve the React app
app.get("*", (_req, res) => {
  res.sendFile(path.join(DIST, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});