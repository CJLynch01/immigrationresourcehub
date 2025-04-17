import { requireRole, logout, getToken, showNavByAuth } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const payload = requireRole("admin");
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

  const welcome = document.getElementById("welcomeMessage");
  if (welcome && payload?.email) {
    welcome.textContent = `Welcome, Admin (${payload.email})`;
  }

  const postForm = document.getElementById("post-form");
  const postsContainer = document.getElementById("admin-posts");
  const uploadsContainer = document.getElementById("admin-uploads");
  const adminSendForm = document.getElementById("admin-send-form");

  // ✅ Create a blog post
  postForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const category = document.getElementById("category").value;

    try {
      const res = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title, content, category })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Post created!");
        postForm.reset();
        loadPosts();
      } else {
        alert(data.error || "Error creating post.");
      }
    } catch (err) {
      console.error("Post error:", err);
      alert("Failed to create post.");
    }
  });

  // ✅ Load blog posts
  async function loadPosts() {
    try {
      const res = await fetch("http://localhost:3000/api/posts");
      const posts = await res.json();

      postsContainer.innerHTML = posts.length
        ? posts.map(post => `
            <div class="post" style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
              <h3>${post.title}</h3>
              <p><strong>Category:</strong> ${post.category}</p>
              <p>${post.content}</p>
              <button onclick="deletePost('${post._id}')">🗑 Delete</button>
            </div>
          `).join("")
        : "<p>No blog posts yet.</p>";
    } catch (err) {
      console.error("Error loading posts:", err);
      postsContainer.innerHTML = "<p>Failed to load blog posts.</p>";
    }
  }

  // ✅ Load all client uploads
  async function loadUploads() {
    try {
      const res = await fetch("http://localhost:3000/api/uploads", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const docs = await res.json();

      uploadsContainer.innerHTML = docs.length
        ? docs.map(doc => `
            <div class="upload" style="border:1px solid #666; padding:10px; margin-bottom:10px;">
              <p><strong>Client:</strong> ${doc.userId?.email || "Unknown"}</p>
              <p><strong>Type:</strong> ${doc.docType}</p>
              <p><strong>Uploaded:</strong> ${new Date(doc.uploadedAt).toLocaleString()}</p>
              <a href="${doc.s3Url}" target="_blank">📂 View</a>
              ${!doc.reviewed
                ? `<button onclick="markReviewed('${doc._id}')">✅ Mark Reviewed</button>`
                : `<span style="color:green;">Reviewed</span>`}
            </div>
          `).join("")
        : "<p>No uploaded documents.</p>";
    } catch (err) {
      console.error("Error loading uploads:", err);
      uploadsContainer.innerHTML = "<p>Failed to load uploads.</p>";
    }
  }

  // ✅ Send document to dashboard or email
  adminSendForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(adminSendForm);
    const token = getToken();
    const deliveryMethod = document.getElementById("deliveryMethod").value;
    formData.append("deliveryMethod", deliveryMethod);

    try {
      const res = await fetch("http://localhost:3000/api/uploads/admin-send", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Document successfully sent via ${deliveryMethod}`);
        adminSendForm.reset();
      } else {
        alert(data.error || "Failed to send document.");
      }
    } catch (err) {
      console.error("Send error:", err);
      alert("Error sending document.");
    }
  });

  // ✅ Delete blog post
  window.deletePost = async (postId) => {
    if (!confirm("Delete this post?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      if (res.ok) {
        alert("Post deleted.");
        loadPosts();
      } else {
        alert("Failed to delete post.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✅ Mark a document as reviewed
  window.markReviewed = async (docId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/uploads/${docId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (res.ok) {
        alert("Marked as reviewed.");
        loadUploads();
      } else {
        alert("Failed to mark as reviewed.");
      }
    } catch (err) {
      console.error("Review error:", err);
    }
  };

  // 🔄 Initial load
  loadPosts();
  loadUploads();
});