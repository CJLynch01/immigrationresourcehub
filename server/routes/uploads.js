const express = require("express");
const router = express.Router();
const multer = require("multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../config/s3");
const { verifyToken, isAdmin } = require("../middleware/auth");
const Document = require("../models/document");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Multer setup (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * ✅ Client uploads a document
 */
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  const file = req.file;
  const { docType } = req.body;

  if (!file) return res.status(400).json({ error: "File is required." });

  const fileKey = `client/${req.user.id}/${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "private",
    ContentDisposition: "inline"
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);

    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    const document = new Document({
      userId: req.user.id,
      docType,
      filename: file.originalname,
      contentType: file.mimetype,
      s3Url,
      sentByAdmin: false
    });

    await document.save();
    res.status(201).json({ msg: "Upload successful", url: s3Url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

/**
 * ✅ Admin sends document to dashboard or email
 */
router.post("/admin-send", verifyToken, isAdmin, upload.single("file"), async (req, res) => {
  const { userId, docType, deliveryMethod } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "File is required." });

  const fileKey = `admin/${userId}/${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "private"
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);

    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    // 📥 If delivery method is dashboard
    if (deliveryMethod === "dashboard") {
      const document = new Document({
        userId,
        docType,
        filename: file.originalname,
        contentType: file.mimetype,
        s3Url,
        sentByAdmin: true
      });

      await document.save();
      return res.status(201).json({ msg: "Sent to client dashboard", url: s3Url });
    }

    // 📧 Otherwise send email
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return res.status(404).json({ error: "User not found or missing email" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // smtp.hostinger.com
      port: Number(process.env.SMTP_PORT), // must be a number
      secure: process.env.SMTP_SECURE === "true", // boolean for TLS
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "New Document from Immigration Pathways",
      html: `
        <p>Hello ${user.name || "Client"},</p>
        <p>A new document has been shared with you:</p>
        <p><strong>${docType}</strong></p>
        <p><a href="${s3Url}" target="_blank">📂 Click here to view/download</a></p>
        <br><p>– Immigration Pathways Consulting</p>
      `
    });

    return res.status(200).json({ msg: "Email sent successfully." });
  } catch (err) {
    console.error("Admin send error:", err);
    res.status(500).json({ error: "Failed to send document" });
  }
});

/**
 * ✅ Admin fetches all uploads (for review)
 */
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const docs = await Document.find()
      .sort({ uploadedAt: -1 })
      .populate("userId", "email");
    res.json(docs);
  } catch (err) {
    console.error("Load uploads error:", err);
    res.status(500).json({ error: "Failed to load documents" });
  }
});

router.get("/signed-url/*", verifyToken, async (req, res) => {
  const key = req.params[0]; // This will capture the full path
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: "inline"
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    res.json({ url: signedUrl });
  } catch (err) {
    console.error("Failed to generate signed URL:", err);
    res.status(500).json({ error: "Could not generate signed URL" });
  }
});

/**
 * ✅ Client fetches their own documents
 */
router.get("/my-uploads", verifyToken, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error("My uploads error:", err);
    res.status(500).json({ error: "Failed to load your documents" });
  }
});

const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Extract key from S3 URL
    const s3Key = doc.s3Url.split(".amazonaws.com/")[1];

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key
    });
    await s3.send(command);

    // Delete from MongoDB
    await Document.findByIdAndDelete(req.params.id);

    res.json({ msg: "Document deleted from S3 and database." });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

module.exports = router;