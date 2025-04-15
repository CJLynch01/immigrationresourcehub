const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Any logged-in user
router.get("/user-dashboard", verifyToken, (req, res) => {
  res.json({ msg: `Welcome ${req.user.role}, this is your dashboard.` });
});

// Admin-only
router.get("/admin-only", verifyToken, requireAdmin, (req, res) => {
  res.json({ msg: "Welcome Admin. You have elevated access." });
});

// Catch All
router.get("/", verifyToken, (req, res) => {
    res.json({ msg: "Protected route root is working." });
  });

module.exports = router;