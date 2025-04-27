import { requireRole, logout, getToken, showNavByAuth } from "./auth.js";

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

  const postForm = document.getElementById("post-form");
  const postsContainer = document.getElementById("admin-posts");
  const contentField = document.getElementById("content");

  if (!postForm || !postsContainer || !contentField) return;

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
      const wrap = tag.length === 2;
      insert(tag, wrap);
    });
  });

  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const content = contentField.value;
    const postDate = document.getElementById("postDate").value;

    try {
      const res = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title, content, category, date: postDate })
      });

      if (res.ok) {
        alert("Post created!");
        postForm.reset();
        loadPosts();
      } else {
        const data = await res.json();
        alert(data.error || "Error creating post.");
      }
    } catch (err) {
      console.error("Post creation error:", err);
      alert("Failed to create post.");
    }
  });

  async function loadPosts() {
    const postsContainer = document.getElementById("admin-posts");
    if (!postsContainer) return;

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
        alert("Post updated!");
        loadPosts();
      } else {
        alert("Failed to update post.");
      }
    } catch (err) {
      console.error("Error saving post:", err);
      alert("Error updating post.");
    }
  };

  window.deletePost = async (id) => {
    if (!confirm("Delete this post?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (res.ok) {
        alert("Post deleted.");
        loadPosts();
      } else {
        alert("Failed to delete post.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting post.");
    }
  };

  loadPosts();
});