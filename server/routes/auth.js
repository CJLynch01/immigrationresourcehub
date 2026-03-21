const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { verifyToken, isAdmin } = require("../middleware/auth");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const User = require("../models/user");
const nodemailer = require("nodemailer");

// Setup mailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD
  }
});

//POST /api/auth/login — Login with optional MFA
router.post("/login", async (req, res) => {
  try {
    const { email, password, token } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ msg: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    if (user.mfa?.enabled) {
      if (!token) {
        return res.status(206).json({ mfaRequired: true, msg: "MFA code required." });
      }

      const isValid = speakeasy.totp.verify({
        secret: user.mfa.secret,
        encoding: "base32",
        token,
        window: 1
      });

      if (!isValid) {
        return res.status(400).json({ msg: "Invalid MFA code." });
      }
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token: jwtToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error." });
  }
});

//POST /api/auth/register — New user registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ msg: "Name, email, and password are required." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ msg: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.trim() });
    if (existing) return res.status(400).json({ msg: "Email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role: "client" });
    await newUser.save();

    // 🔔 Notify Admin of new registration
    if (process.env.ADMIN_EMAIL) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: "🔔 New User Registration",
        html: `
          <p>A new user has registered:</p>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Role:</strong> client</li>
          </ul>
        `
      });
    }

    res.status(201).json({ msg: "User registered." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Failed to register user." });
  }
});

//GET /api/auth/me — Get current user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Fetch me error:", err);
    res.status(500).json({ error: "Failed to fetch user info." });
  }
});

//GET /api/auth/clients — Admin-only: get list of clients
router.get("/clients", verifyToken, isAdmin, async (req, res) => {
  try {
    const clients = await User.find({ role: "client" }).select("_id name email");
    res.json(clients);
  } catch (err) {
    console.error("Client list error:", err);
    res.status(500).json({ error: "Could not load client list." });
  }
});

//POST /api/auth/mfa/setup — Generate MFA secret and QR code
router.post("/mfa/setup", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const secret = speakeasy.generateSecret({ name: "Immigration Pathways" });
    user.mfa = {
      secret: secret.base32,
      enabled: false
    };
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ error: "Failed to generate QR code" });
      res.json({ qrCode: data_url });
    });
  } catch (err) {
    console.error("MFA setup error:", err);
    res.status(500).json({ error: "Failed to setup MFA." });
  }
});

//POST /api/auth/mfa/verify
router.post("/mfa/verify", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  const { token } = req.body;

  if (!user || !user.mfa?.secret) {
    return res.status(400).json({ error: "MFA setup not found." });
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfa.secret,
    encoding: "base32",
    token,
    window: 1
  });

  if (!verified) {
    return res.status(400).json({ error: "Invalid MFA token." });
  }

  user.mfa.enabled = true;
  await user.save();

  res.json({ msg: "MFA enabled successfully." });
});

//POST /api/auth/forgot-password — Send reset link
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond the same way to prevent email enumeration
    if (!user) {
      return res.json({ msg: "If that email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset — Immigration Pathways Consulting",
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to set a new password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}" style="color:#c9a84c">Reset My Password</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p>— Immigration Pathways Consulting</p>
      `
    });

    res.json({ msg: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

//POST /api/auth/reset-password — Set new password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Reset link is invalid or has expired." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: "Password updated successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;