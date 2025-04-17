const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    docType: String,
    s3Url: String,
    filename: String,
    contentType: String,
    reviewed: { type: Boolean, default: false },
    sentByAdmin: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Document", DocumentSchema);