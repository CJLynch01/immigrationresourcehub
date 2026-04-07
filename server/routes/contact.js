const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const ContactSubmission = require("../models/ContactSubmission");
const { verifyToken, isAdmin } = require("../middleware/auth");

function escapeHtml(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
});

// POST /api/contact — public, save to DB + email admin
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address." });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: "Name must be 100 characters or fewer." });
    }
    if (message.trim().length > 3000) {
      return res.status(400).json({ error: "Message must be 3000 characters or fewer." });
    }

    // Save to DB first (so the lead is never lost)
    const submission = new ContactSubmission({ name: name.trim(), email: email.trim(), message: message.trim() });
    await submission.save();

    // Then try to email admin (non-fatal if it fails)
    if (process.env.ADMIN_EMAIL) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: process.env.ADMIN_EMAIL,
          replyTo: email.trim(),
          subject: `New Contact Form Submission from ${name.trim()}`,
          html: `
            <p><strong>Name:</strong> ${escapeHtml(name.trim())}</p>
            <p><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message.trim()).replace(/\n/g, "<br>")}</p>
          `,
        });
      } catch (emailErr) {
        console.error("Contact email failed (submission saved):", emailErr.message);
      }
    }

    res.status(201).json({ msg: "Message received! We'll be in touch within 24 hours." });
  } catch (err) {
    console.error("Contact submission error:", err);
    res.status(500).json({ error: "Failed to submit. Please try again." });
  }
});

// GET /api/contact/unread-count — admin only
router.get("/unread-count", verifyToken, isAdmin, async (req, res) => {
  try {
    const count = await ContactSubmission.countDocuments({ isRead: false });
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ error: "Failed to count unread contacts." });
  }
});

// GET /api/contact — admin only, view all submissions
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load submissions." });
  }
});

// PUT /api/contact/:id/read — mark as read
router.put("/:id/read", verifyToken, isAdmin, async (req, res) => {
  try {
    await ContactSubmission.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ msg: "Marked as read." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update." });
  }
});

module.exports = router;
