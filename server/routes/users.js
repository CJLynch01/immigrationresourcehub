const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const { verifyToken, isAdmin } = require("../middleware/auth.js");
const bcrypt = require("bcryptjs");

router.get("/clients", verifyToken, isAdmin, async (req, res) => {
  try {
    const clients = await User.find({ role: "client" }).select("_id name email createdAt");
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Failed to load clients." });
  }
});

router.delete("/clients/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.role === "admin") return res.status(403).json({ error: "Cannot delete an admin account." });
    await user.deleteOne();
    res.json({ msg: "Client removed." });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove client." });
  }
});

router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error while changing password." });
  }
});


module.exports = router;
