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
        const res = await fetch("https://immigrationresourcehub.onrender.com/api/messages/unread-count", {
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
      const res = await fetch("https://immigrationresourcehub.onrender.com/api/uploads", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const docs = await res.json();
      const clientDocsContainer = document.getElementById("client-documents");
      const adminDocsContainer = document.getElementById("admin-documents");
      if (!clientDocsContainer || !adminDocsContainer) return;
      const clientDocs = docs.filter(doc => !doc.sentByAdmin);
      const adminDocs = docs.filter(doc => doc.sentByAdmin);

      const renderDocs = async (docArray) => {
        return await Promise.all(docArray.map(async (doc) => {
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
      };

      clientDocsContainer.innerHTML = (await renderDocs(clientDocs)).join("");
      adminDocsContainer.innerHTML = (await renderDocs(adminDocs)).join("");
    } catch (err) {
      console.error("Error loading uploads:", err);
    }
  }

  async function getSignedUrlFromS3(s3Url) {
    const key = s3Url.split(".amazonaws.com/")[1];
    const res = await fetch(`https://immigrationresourcehub.onrender.com/api/uploads/signed-url/${key}`, {
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
      const res = await fetch("https://immigrationresourcehub.onrender.com/api/uploads/admin-send", {
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
      const res = await fetch(`https://immigrationresourcehub.onrender.com/api/uploads/${docId}`, {
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
    const token = getToken();
    const dropdown = document.getElementById("clientDropdown");
    const userIdField = document.getElementById("userId");

    if (!dropdown || !userIdField) return;

    try {
      const res = await fetch("https://immigrationresourcehub.onrender.com/api/auth/clients", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to load clients. Status:", res.status, "Message:", errorData?.msg || errorData?.error);
        dropdown.innerHTML = '<option value="">⚠️ Unable to load clients</option>';
        return;
      }

      const clients = await res.json();

      dropdown.innerHTML =
        '<option value="">-- Choose a client --</option>' +
        clients.map(c => `<option value="${c._id}">${c.name} (${c.email})</option>`).join("");

      dropdown.addEventListener("change", () => {
        userIdField.value = dropdown.value;
      });
    } catch (err) {
      console.error("❌ Exception loading clients:", err);
      dropdown.innerHTML = '<option value="">⚠️ Error loading clients</option>';
    }
  }


  async function checkMfaStatus() {
    const token = localStorage.getItem("token");
    console.log("Token for /api/auth/me:", token);

    const res = await fetch("https://immigrationresourcehub.onrender.com/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await res.json();
    console.log("/me response:", user);
    const mfaDiv = document.getElementById("mfaStatus");
    if (user.mfa?.enabled) {
      mfaDiv.textContent = "✅ MFA is enabled";
    } else {
      mfaDiv.innerHTML = `<button id="enableMfaBtn">Enable MFA</button>`;
      document.getElementById("enableMfaBtn").addEventListener("click", async () => {
        const res = await fetch("https://immigrationresourcehub.onrender.com/api/auth/mfa/setup", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        mfaDiv.innerHTML = `
          <p>Scan this QR code with your authenticator app:</p>
          <img src="${data.qrCode}" alt="QR Code">
        `;
        document.getElementById("mfaVerifySection").style.display = "block";
      });
    }
  }

  document.getElementById("verifyMfaBtn")?.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    const mfaToken = document.getElementById("verifyMfaToken").value.trim();
    const msgEl = document.getElementById("mfaVerifyMsg");
    try {
      const res = await fetch("https://immigrationresourcehub.onrender.com/api/auth/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ token: mfaToken })
      });
      const data = await res.json();
      if (res.ok) {
        msgEl.textContent = "✅ MFA enabled successfully!";
        msgEl.style.color = "green";
        document.getElementById("mfaStatus").textContent = "✅ MFA is enabled";
        document.getElementById("mfaVerifySection").style.display = "none";
      } else {
        msgEl.textContent = "❌ " + (data.error || "Verification failed.");
        msgEl.style.color = "red";
      }
    } catch (err) {
      console.error("Verify MFA failed:", err);
      msgEl.textContent = "❌ Could not verify MFA.";
      msgEl.style.color = "red";
    }
  });

  const form = document.getElementById("changePasswordForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("🟢 SUBMIT HANDLER TRIGGERED");

      const token = getToken();
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;

      try {
        const res = await fetch("https://immigrationresourcehub.onrender.com/api/users/change-password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await res.json();
        const msg = document.getElementById("passwordMessage");
        msg.textContent = data.message || data.error;
        msg.style.color = res.ok ? "green" : "red";
      } catch (err) {
        console.error("❌ Error changing password:", err);
      }
    });
  }

  checkMfaStatus();
  updateMessageStats();
  loadUnreadMessages();
  populateClientDropdown();
  loadUploads();
});
