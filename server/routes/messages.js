import express from "express";
import Message from "../models/message.js"; // your Message model
import { verifyToken, isAdmin } from "../middleware/auth.js"; // your middleware

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

export default router;
