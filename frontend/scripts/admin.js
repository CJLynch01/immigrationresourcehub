document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // Check token
  if (!token) {
    alert("Access denied. Please log in.");
    window.location.href = "login.html";
    return;
  }

  // Decode token & check role
  let payload;
  try {
    payload = JSON.parse(atob(token.split('.')[1]));
  } catch {
    alert("Invalid token.");
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return;
  }

  if (payload.role !== "admin") {
    alert("Admin access only.");
    window.location.href = "login.html";
    return;
  }

  // ✅ Toggle nav links
  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");
  if (loginLink) loginLink.style.display = "none";
  if (logoutLink) {
    logoutLink.style.display = "inline";
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });
  }

  // ✅ Post logic
  const postForm = document.getElementById("post-form");
  const postsContainer = document.getElementById("admin-posts");

  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const category = document.getElementById("category").value;

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

  // Load posts
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

  // Delete post
  window.deletePost = async (postId) => {
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