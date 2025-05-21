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

app.use(cors({
  origin: "https://immigrationpathwaysconsulting.com",
  credentials: true
}));

connectDB();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quiz", quizRoutes);

app.get("/", (req, res) => {
  res.send("Immigration Resource Hub API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
