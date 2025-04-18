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

  const postForm = document.getElementById("post-form");
  const postsContainer = document.getElementById("admin-posts");
  const uploadsContainer = document.getElementById("admin-documents");

  // ✅ Format buttons (insert markdown)
  const contentField = document.getElementById("content");
  const insert = (tag, wrap = false) => {
    const start = contentField.selectionStart;
    const end = contentField.selectionEnd;
    const selected = contentField.value.slice(start, end);
    const formatted = wrap ? `${tag}${selected}${tag}` : `${tag} ${selected}`;
    contentField.setRangeText(formatted, start, end, "end");
    contentField.focus();
  };

  document.querySelectorAll("[data-md]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.md;
      const wrap = tag.length === 2; // like ** or _ or ~
      insert(tag, wrap);
    });
  });

  // ✅ Create blog post
  postForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const content = contentField.value;
    const postDate = document.getElementById("postDate").value;

    console.log("📅 Date being sent:", postDate);

    try {
      const res = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title, content, category, date: postDate })
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
          <div class="post" id="post-${post._id}">
            <h3 contenteditable="false" class="editable-title">${post.title}</h3>
            <p><strong>Date:</strong> <span contenteditable="false" class="editable-date">${post.date || "N/A"}</span></p>
            <p><strong>Category:</strong> <span contenteditable="false" class="editable-category">${post.category}</span></p>
            <div class="editable-content" contenteditable="false">${marked.parse(post.content)}</div>
            <button onclick="editPost('${post._id}')">✏️ Edit</button>
            <button onclick="deletePost('${post._id}')">🗑 Delete</button>
            <button onclick="savePost('${post._id}')" style="display:none;" id="save-${post._id}">💾 Save</button>
          </div>
        `).join("")
        : "<p>No blog posts yet.</p>";
    } catch (err) {
      console.error("Error loading posts:", err);
      postsContainer.innerHTML = "<p>Failed to load blog posts.</p>";
    }
  }

  // ✅ Delete post
  window.deletePost = async (id) => {
    if (!confirm("Delete this post?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      if (res.ok) {
        alert("Post deleted.");
        loadPosts();
      } else {
        alert("Failed to delete.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  async function loadUploads() {
    try {
      const res = await fetch("http://localhost:3000/api/uploads", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
  
      const docs = await res.json();
  
      const cards = await Promise.all(
        docs.map(async (doc) => {
          const key = extractKeyFromS3Url(doc.s3Url);
          let signedUrl = "#";
  
          try {
            const urlRes = await fetch(`http://localhost:3000/api/uploads/signed-url/${key}`, {
              headers: { Authorization: `Bearer ${getToken()}` }
            });
  
            const data = await urlRes.json();
            console.log("Signed URL for", key, "→", data);
            if (data?.url) {
              signedUrl = data.url;
            } else {
              console.warn("No signed URL returned for:", key);
            }
          } catch (err) {
            console.error("Error getting signed URL:", err);
          }
  
          return `
            <div class="doc-card">
              <p><strong>Client:</strong> ${doc.userId?.email || "Unknown"}</p>
              <p><strong>Type:</strong> ${doc.docType}</p>
              <p><strong>Uploaded:</strong> ${new Date(doc.uploadedAt).toLocaleString()}</p>
              <a href="${signedUrl}" download target="_blank" class="download-link">📥 Download</a>
              &nbsp;|&nbsp;
              <a href="${signedUrl}" target="_blank" rel="noopener noreferrer" class="download-link">📂 View Document</a>
              ${!doc.reviewed
                ? `<button onclick="markReviewed('${doc._id}')">✅ Mark Reviewed</button>`
                : `<span style="color:green;">Reviewed</span>`}
            </div>
          `;
        })
      );
  
      uploadsContainer.innerHTML = cards.join("");
    } catch (err) {
      console.error("Error loading documents:", err);
      uploadsContainer.innerHTML = "<p>Failed to load documents.</p>";
    }
  }

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

  window.editPost = (id) => {
    const postEl = document.getElementById(`post-${id}`);
    postEl.querySelectorAll("[contenteditable]").forEach(el => el.contentEditable = true);
    postEl.querySelector(`#save-${id}`).style.display = "inline";
  };
  
  window.savePost = async (id) => {
    const postEl = document.getElementById(`post-${id}`);
    const title = postEl.querySelector(".editable-title").innerText.trim();
    const date = postEl.querySelector(".editable-date").innerText.trim();
    const category = postEl.querySelector(".editable-category").innerText.trim();
    const content = postEl.querySelector(".editable-content").innerText.trim();
  
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title, content, category, date })
      });
  
      if (res.ok) {
        alert("Post updated.");
        postEl.querySelectorAll("[contenteditable]").forEach(el => el.contentEditable = false);
        postEl.querySelector(`#save-${id}`).style.display = "none";
        loadPosts();
      } else {
        alert("Update failed.");
      }
    } catch (err) {
      console.error("Edit error:", err);
      alert("Error updating post.");
    }
  };

function extractKeyFromS3Url(url) {
  const parts = url.split(".amazonaws.com/");
  return parts.length > 1 ? parts[1] : "";
}

async function getSignedUrl(key) {
  try {
    const res = await fetch(`http://localhost:3000/api/uploads/signed-url/${key}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    return data.url || "#";
  } catch (err) {
    console.error("Signed URL error:", err);
    return "#";
  }
}


  loadUploads();
  loadPosts();
});