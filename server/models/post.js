const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: "General" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);