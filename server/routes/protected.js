const express = require("express");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// For logged-in clients or admins
router.get("/user-dashboard", verifyToken, (req, res) => {
  res.json({ msg: `Welcome ${req.user.role}, this is your dashboard.` });
});

// For admin only
router.get("/admin-only", isAdmin, (req, res) => {
  res.json({ msg: "Welcome Admin. You have elevated access." });
});

// Catch-all test
router.get("/", verifyToken, (req, res) => {
  res.json({ msg: "Protected route root is working." });
});

module.exports = router;