import { requireRole, logout, getToken, showNavByAuth } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const payload = requireRole("client");
  showNavByAuth();

  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");

  if (loginLink) loginLink.style.display = "none";
  if (logoutLink) {
    logoutLink.style.display = "inline";
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // ✅ Upload a document
  const uploadForm = document.getElementById("uploadForm");

  uploadForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(uploadForm);
    const token = getToken();

    try {
      const res = await fetch("http://localhost:3000/api/uploads/my-uploads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        alert("Document uploaded successfully!");
        uploadForm.reset();
        loadMyUploads();
      } else {
        alert(data.error || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong during upload.");
    }
  });

  // ✅ Load and separate client vs admin documents
  async function loadMyUploads() {
    const token = getToken();
    const myUploads = document.getElementById("my-uploaded-docs");
    const adminUploads = document.getElementById("admin-sent-docs");
  
    if (!myUploads || !adminUploads) return;
  
    try {
      const res = await fetch("http://localhost:3000/api/uploads/my-uploads", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const docs = await res.json();
  
      const uploadedByClient = docs.filter(doc => !doc.sentByAdmin);
      const sentByAdmin = docs.filter(doc => doc.sentByAdmin);
  
      myUploads.innerHTML = uploadedByClient.length
        ? await Promise.all(uploadedByClient.map(async (doc) => {
            const key = extractKeyFromS3Url(doc.s3Url);
            const signedUrl = await getSignedUrl(key, token);
            return `
              <div class="upload" style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
                <p><strong>Type:</strong> ${doc.docType}</p>
                <p><strong>Uploaded:</strong> ${new Date(doc.uploadedAt).toLocaleString()}</p>
                <a href="${signedUrl}" target="_blank">📂 View</a>
              </div>
            `;
          })).then(htmlArr => htmlArr.join(""))
        : "<p>You haven’t uploaded any documents yet.</p>";
  
      adminUploads.innerHTML = sentByAdmin.length
        ? await Promise.all(sentByAdmin.map(async (doc) => {
            const key = extractKeyFromS3Url(doc.s3Url);
            const signedUrl = await getSignedUrl(key, token);
            return `
              <div class="upload" style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
                <p><strong>Type:</strong> ${doc.docType}</p>
                <p><strong>Received:</strong> ${new Date(doc.uploadedAt).toLocaleString()}</p>
                <a href="${signedUrl}" target="_blank">📂 View</a>
              </div>
            `;
          })).then(htmlArr => htmlArr.join(""))
        : "<p>No documents have been sent by the admin yet.</p>";
  
    } catch (err) {
      console.error("Error loading your documents:", err);
      myUploads.innerHTML = "<p>Failed to load your uploads.</p>";
      adminUploads.innerHTML = "<p>Failed to load admin documents.</p>";
    }
  };

  function extractKeyFromS3Url(url) {
    const parts = url.split(".amazonaws.com/");
    return parts.length > 1 ? parts[1] : "";
  }
  
  async function getSignedUrl(key, token) {
    try {
      const res = await fetch(`http://localhost:3000/api/uploads/signed-url/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      return data.url || "#";
    } catch (err) {
      console.error("Error fetching signed URL:", err);
      return "#";
    }
  }

  loadMyUploads();
});