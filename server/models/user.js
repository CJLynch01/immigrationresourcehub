const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // assuming you use hashed passwords
  role: { type: String, enum: ["client", "admin"], default: "client" },
  mfa: {
    enabled: { type: Boolean, default: false },
    secret: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);