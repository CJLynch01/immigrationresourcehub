import { requireRole, logout } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const payload = requireRole("client");

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

  const postsContainer = document.getElementById("client-posts");

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
            </div>
          `).join("")
        : "<p>No blog posts yet.</p>";
    } catch (err) {
      console.error("Error loading posts:", err);
    }
  }

  loadPosts();
});