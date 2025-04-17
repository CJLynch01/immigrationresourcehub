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
            <div class="post">
              <h3>${post.title}</h3>
              <p><strong>Category:</strong> ${post.category}</p>
              <div>${marked.parse(post.content)}</div>
              <button onclick="deletePost('${post._id}')">🗑 Delete</button>
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

  loadPosts();
});