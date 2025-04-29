import { requireRole, logout, getToken, showNavByAuth } from "./auth.js";
import { updateMessageStats } from "./messageStats.js";

document.addEventListener("DOMContentLoaded", () => {
  requireRole("admin");
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

  async function loadUnreadMessages() {
    const token = getToken();
    const countSpan = document.getElementById("unreadMessagesCount");
  
    if (token && countSpan) {
      try {
        const res = await fetch("http://localhost:3000/api/messages/unread-count", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        countSpan.textContent = data.unreadCount;
      } catch (err) {
        console.error("Failed to load unread messages count:", err);
      }
    }
  }
  

  async function loadUploads() {
    try {
      const res = await fetch("http://localhost:3000/api/uploads", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const docs = await res.json();
      const clientDocsContainer = document.getElementById("client-documents");
      const adminDocsContainer = document.getElementById("admin-documents");

      if (!clientDocsContainer || !adminDocsContainer) return;

      const clientDocs = docs.filter(doc => !doc.sentByAdmin);
      const adminDocs = docs.filter(doc => doc.sentByAdmin);

      const clientHTML = await Promise.all(clientDocs.map(async (doc) => {
        const url = await getSignedUrlFromS3(doc.s3Url);
        return `
          <div class="doc-card">
            <p><strong>Client:</strong> ${doc.userId?.name || "Unknown"}</p>
            <p><strong>Email:</strong> ${doc.userId?.email || "N/A"}</p>
            <p><strong>Type:</strong> ${doc.docType}</p>
            <p><strong>Uploaded:</strong> ${new Date(doc.uploadedAt).toLocaleString()}</p>
            <a href="${url}" target="_blank" class="download-link">📂 View</a>
            <a href="${url}" download class="download-link">📥 Download</a>
            <button class="delete-button" onclick="deleteDocument('${doc._id}')">🗑 Delete</button>
          </div>
        `;
      }));

      const adminHTML = await Promise.all(adminDocs.map(async (doc) => {
        const url = await getSignedUrlFromS3(doc.s3Url);
        return `
          <div class="doc-card">
            <p><strong>Client:</strong> ${doc.userId?.name || "Unknown"}</p>
            <p><strong>Email:</strong> ${doc.userId?.email || "N/A"}</p>
            <p><strong>Type:</strong> ${doc.docType}</p>
            <p><strong>Uploaded:</strong> ${new Date(doc.uploadedAt).toLocaleString()}</p>
            <a href="${url}" target="_blank" class="download-link">📂 View</a>
            <a href="${url}" download class="download-link">📥 Download</a>
            <button class="delete-button" onclick="deleteDocument('${doc._id}')">🗑 Delete</button>
          </div>
        `;
      }));

      clientDocsContainer.innerHTML = clientHTML.join("");
      adminDocsContainer.innerHTML = adminHTML.join("");

    } catch (err) {
      console.error("Error loading uploads:", err);
    }
  }

  async function getSignedUrlFromS3(s3Url) {
    const key = s3Url.split(".amazonaws.com/")[1];
    const res = await fetch(`http://localhost:3000/api/uploads/signed-url/${key}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    return data.url;
  }

  const sendForm = document.getElementById("adminSendForm");

  sendForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(sendForm);
    const token = getToken();

    try {
      const res = await fetch("http://localhost:3000/api/uploads/admin-send", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        alert("File sent to client dashboard.");
        sendForm.reset();
      } else {
        alert(data.error || "Failed to send file.");
      }
    } catch (err) {
      console.error("Send file error:", err);
      alert("Something went wrong.");
    }
  });

  window.deleteDocument = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/uploads/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      if (res.ok) {
        alert("Document deleted.");
        loadUploads();
      } else {
        alert("Failed to delete document.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting document.");
    }
  };

  async function populateClientDropdown() {
    try {
      const res = await fetch("http://localhost:3000/api/auth/clients", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const clients = await res.json();

      const dropdown = document.getElementById("clientDropdown");
      const userIdField = document.getElementById("userId");

      if (!dropdown || !userIdField) return;

      dropdown.innerHTML =
        '<option value="">-- Choose a client --</option>' +
        clients.map(c => `<option value="${c._id}">${c.name} (${c.email})</option>`).join("");

      dropdown.addEventListener("change", () => {
        userIdField.value = dropdown.value;
      });

    } catch (err) {
      console.error("Failed to load clients:", err);
    }
  }

  
  updateMessageStats();
  loadUnreadMessages();
  populateClientDropdown();
  loadUploads();
});