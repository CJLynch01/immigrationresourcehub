const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { verifyToken, isAdmin } = require("../middleware/auth");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const User = require("../models/user");

//POST /api/auth/login — Login with optional MFA
router.post("/login", async (req, res) => {
  try {
    const { email, password, token } = req.body;
    console.log("📥 Login body:", { email, password, token });

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found for:", email);
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔐 Password match:", isMatch);

    if (!isMatch) {
      console.log("❌ Incorrect password for:", email);
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
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

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
    const clients = await User.find({ role: "client" }).select("name email");
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

module.exports = router;
