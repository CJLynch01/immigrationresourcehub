const express = require("express");
const router = express.Router();
const User = require("./models/user.js");
const { verifyToken, isAdmin } = require("../middleware/auth.js");


router.get("/clients", verifyToken, isAdmin, async (req, res) => {
  try {
    const clients = await User.find({ role: "client" }).select("_id name email");
    res.json(clients);
  } catch (err) {
    console.error("Failed to fetch clients:", err);
    res.status(500).json({ error: "Failed to load clients." });
  }
});

module.exports = router;
