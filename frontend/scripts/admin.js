import { requireRole, logout, getToken, showNavByAuth } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const payload = requireRole("admin");

  // Toggle nav links
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

  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const category = document.getElementById("category").value;
    const token = getToken();

    try {
      const res = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, category })
      });

      const data = await res.json();
      if (res.ok) {
        alert("Post created!");
        postForm.reset();
        loadPosts();
      } else {
        alert(data.error || "Error creating post");
      }
    } catch (err) {
      console.error("Post error:", err);
    }
  });

  async function loadPosts() {
    try {
      const res = await fetch("http://localhost:3000/api/posts");
      const posts = await res.json();

      postsContainer.innerHTML = posts.length
        ? posts.map(post => `
            <div class="post">
              <h3>${post.title}</h3>
              <p><strong>Category:</strong> ${post.category}</p>
              <p>${post.content}</p>
              <button onclick="deletePost('${post._id}')">Delete</button>
            </div>
          `).join("")
        : "<p>No posts found.</p>";
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  window.deletePost = async (postId) => {
    const token = getToken();
    if (!confirm("Delete this post?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert("Post deleted.");
        loadPosts();
      } else {
        alert("Delete failed.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  loadPosts();
});