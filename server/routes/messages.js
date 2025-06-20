const express = require("express");
const Message = require("../models/message.js");
const User = require("../models/user.js");
const { verifyToken, isAdmin } = require("../middleware/auth.js");
const nodemailer = require("nodemailer");

const router = express.Router();

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send a new message
router.post("/", verifyToken, async (req, res) => {
  try {
    const { subject, body } = req.body;
    let to = req.body.to;

    if (req.user.role === "client") {
      to = process.env.ADMIN_ID_MONGODB;
    }

    const message = new Message({
      from: req.user.id,
      to,
      subject,
      body,
    });

    await message.save();

    // Look up sender and recipient
    const [sender, recipient] = await Promise.all([
      User.findById(req.user.id).select("name email"),
      User.findById(to).select("name email"),
    ]);

    // Send email notification
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipient.email,
      subject: `📬 New Message from ${sender.name}`,
      html: `
        <p>You have a new message from ${sender.name}:</p>
        <p><strong>Subject:</strong> ${message.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.body}</p>
        <br>
        <p>Log in to view and reply: <a href="https://www.immigrationpathwaysconsulting.com/client.html">Client Dashboard</a></p>
      `,
    });

    res.status(201).json({ msg: "Message sent and email delivered!" });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// Get inbox messages
router.get("/inbox", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ to: req.user.id })
      .populate("from", "_id name email")
      .populate("to", "_id name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch inbox error:", err);
    res.status(500).json({ error: "Failed to load messages." });
  }
});

// Get count of unread messages (admin only)
router.get("/unread-count", verifyToken, isAdmin, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      to: req.user.id,
      isRead: false,
    });
    res.json({ unreadCount: count });
  } catch (err) {
    console.error("Unread count error:", err);
    res.status(500).json({ error: "Failed to count unread messages." });
  }
});

// Delete a message
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    if (
      message.from.toString() !== req.user.id &&
      message.to.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Not authorized to delete this message." });
    }

    await message.deleteOne();
    res.json({ msg: "Message deleted." });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ error: "Failed to delete message." });
  }
});

// Mark message as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ msg: "Message marked as read." });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ error: "Failed to mark as read." });
  }
});

// Get sent messages
router.get("/sent", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ from: req.user.id })
      .populate("to", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch sent error:", err);
    res.status(500).json({ error: "Failed to load sent messages." });
  }
});

module.exports = router;
