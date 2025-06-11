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
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow both Render and your domain
const allowedOrigins = new Set([
  "https://immigrationpathwaysconsulting.com",
  "https://www.immigrationpathwaysconsulting.com",
  "https://immigrationresourcehub.onrender.com",
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
app.use(express.json());

// 🔹 Serve landing.html at root BEFORE static middleware
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "landing.html"));
});

// Redirect landing.html route back to /
app.get("/landing.html", (req, res) => {
  res.redirect("/");
});

// 🔹 Static middleware comes AFTER
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.use((req, res, next) => {
  if (req.hostname === 'immigrationpathwaysconsulting.com') {
    return res.redirect(301, 'https://www.immigrationpathwaysconsulting.com' + req.originalUrl);
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quiz", quizRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});