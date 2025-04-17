const express = require("express");
const Post = require("../models/post");
const { isAdmin } = require("../middleware/auth");

const router = express.Router();

// Create a new post (Admin only)
router.post("/", isAdmin, async (req, res) => {
  try {
    const { title, content, category, date } = req.body;
    const post = new Post({
      title,
      content,
      category,
      date,
      author: req.user.id,
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts (Public)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a post (Admin only)
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a post (Admin only)
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;