const express = require("express");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/user-dashboard", verifyToken, (req, res) => {
  res.json({ msg: `Welcome ${req.user.role}` });
});

router.get("/admin-only", isAdmin, (req, res) => {
  res.json({ msg: "Welcome Admin" });
});

module.exports = router;
