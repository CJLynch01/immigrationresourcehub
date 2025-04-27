const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const postRoutes = require("./routes/posts");
const uploadRoutes = require("./routes/uploads")
const messageRoutes = require("./routes/messages");
const cors = require("cors");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Immigration Resource Hub API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});