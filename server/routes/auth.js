const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user")

const router = express.Router();

//Register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashed });
        await user.save();

        res.status(201).json({ msg: "registration successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials"});

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ msg: "Invalid credentials"});

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {expiresIn: "1d"});
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;