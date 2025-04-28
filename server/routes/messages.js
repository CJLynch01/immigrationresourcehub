const express = require("express");
const Message = require("../models/message.js");
const { verifyToken, isAdmin } = require("../middleware/auth.js");

const router = express.Router();

// ✉️ Send a new message
router.post("/", verifyToken, async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    const message = new Message({
      from: req.user.id,
      to,
      subject,
      body
    });

    await message.save();
    res.status(201).json({ msg: "Message sent!" });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// 📬 Fetch inbox messages (received)
router.get("/inbox", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ to: req.user.id })
      .populate("from", "name email") // show sender name/email
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch inbox error:", err);
    res.status(500).json({ error: "Failed to load messages." });
  }
});

// 🔔 Count unread messages (admin only)
router.get("/unread-count", verifyToken, isAdmin, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      to: req.user.id,
      isRead: false
    });
    res.json({ unreadCount: count });
  } catch (err) {
    console.error("Unread count error:", err);
    res.status(500).json({ error: "Failed to count unread messages." });
  }
});

// 👀 Mark a message as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ msg: "Message marked as read." });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ error: "Failed to mark as read." });
  }
});

// 🗑️ Delete a message
router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const message = await Message.findById(req.params.id);
  
      if (!message) {
        return res.status(404).json({ error: "Message not found." });
      }
  
      // Only allow delete if user is sender or recipient
      if (message.from.toString() !== req.user.id && message.to.toString() !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to delete this message." });
      }
  
      await message.deleteOne();
      res.json({ msg: "Message deleted." });
    } catch (err) {
      console.error("Delete message error:", err);
      res.status(500).json({ error: "Failed to delete message." });
    }
  });

module.exports = router;