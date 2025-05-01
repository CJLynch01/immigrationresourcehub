const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const { verifyToken, isAdmin } = require("../middleware/auth.js");
const bcrypt = require("bcryptjs");


router.get("/clients", verifyToken, isAdmin, async (req, res) => {
  try {
    const clients = await User.find({ role: "client" }).select("_id name email");
    res.json(clients);
  } catch (err) {
    console.error("Failed to fetch clients:", err);
    res.status(500).json({ error: "Failed to load clients." });
  }
});

router.put("/change-password", verifyToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      console.log("🔧 Change Password Attempt:", { userId: req.user.id, currentPassword, newPassword });
  
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found." });
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      console.log("🔐 Current password match:", isMatch);
  
      if (!isMatch) return res.status(401).json({ message: "Current password is incorrect." });
  
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
  
      console.log("✅ Password updated successfully for:", user.email);
      res.json({ message: "Password changed successfully." });
    } catch (err) {
      console.error("❌ Password change error:", err);
      res.status(500).json({ error: "Server error while changing password." });
    }
  });

module.exports = router;
