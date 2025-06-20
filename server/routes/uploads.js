const express = require("express");
const router = express.Router();
const multer = require("multer");
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../config/s3");
const { verifyToken, isAdmin } = require("../middleware/auth");
const Document = require("../models/document");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const allowedTypes = ['application/pdf'];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  }
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Client uploads a document
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

    const adminEmail = process.env.ADMIN_EMAIL;
    const user = await User.findById(req.user.id);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: "📅 New Document Uploaded by Client",
      html: `
        <p>${user.name || "A client"} has uploaded a new document:</p>
        <p><strong>Document Type:</strong> ${docType}</p>
        <p><strong>Filename:</strong> ${file.originalname}</p>
        <p>Check the <a href="https://www.immigrationpathwaysconsulting.com/admin.html">Admin Dashboard</a> for details.</p>
      `
    });

    res.status(201).json({ msg: "Upload successful", url: s3Url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

// Admin sends document to dashboard or email
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
    const user = await User.findById(userId);

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

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "📁 New Document Added to Your Dashboard",
        html: `
          <p>Hello ${user.name || "Client"},</p>
          <p>A new document has been added to your client portal:</p>
          <p><strong>${docType}</strong></p>
          <p>Please log in to view: <a href="https://www.immigrationpathwaysconsulting.com/client.html">Client Dashboard</a></p>
          <br><p>– Immigration Pathways Consulting</p>
        `
      });

      return res.status(201).json({ msg: "Sent to client dashboard", url: s3Url });
    }

    // Otherwise send via email
    if (!user || !user.email) {
      return res.status(404).json({ error: "User not found or missing email" });
    }

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

// Admin fetches all uploaded documents
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const docs = await Document.find()
      .sort({ uploadedAt: -1 })
      .populate("userId", "name email");
    res.json(docs);
  } catch (err) {
    console.error("Load uploads error:", err);
    res.status(500).json({ error: "Failed to load documents" });
  }
});

// Generate signed URL for protected access
router.get("/signed-url/*", verifyToken, async (req, res) => {
  const key = req.params[0];
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

// Client fetches their own documents
router.get("/my-uploads", verifyToken, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error("My uploads error:", err);
    res.status(500).json({ error: "Failed to load your documents" });
  }
});

// Delete document from S3 and DB (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const s3Key = doc.s3Url.split(".amazonaws.com/")[1];

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key
    });
    await s3.send(command);

    await Document.findByIdAndDelete(req.params.id);

    res.json({ msg: "Document deleted from S3 and database." });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

module.exports = router;