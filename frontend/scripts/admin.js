// Protect admin page and load content
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const postForm = document.getElementById("post-form");
    const postsContainer = document.getElementById("admin-posts");
  
    // Protect the page
    if (postsContainer && !token) {
      alert("Access denied. Please log in as admin.");
      window.location.href = "login.html";
      return;
    }
  
    // Submit new post
    if (postForm) {
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
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content, category }),
          });
  
          if (res.ok) {
            alert("Post created!");
            postForm.reset();
            loadAdminPosts(); // Refresh the list
          } else {
            const err = await res.json();
            alert("Failed: " + err.error || err.msg);
          }
        } catch (err) {
          alert("Error creating post");
        }
      });
    }
  
    // Load posts into admin view
    async function loadAdminPosts() {
      if (!postsContainer) return;
      postsContainer.innerHTML = "Loading...";
  
      try {
        const res = await fetch("http://localhost:3000/api/posts");
        const posts = await res.json();
  
        postsContainer.innerHTML = posts.map((post) => `
          <div class="post">
            <h3>${post.title}</h3>
            <p><strong>Category:</strong> ${post.category}</p>
            <p>${post.content}</p>
            <button onclick="deletePost('${post._id}')">Delete</button>
          </div>
        `).join("");
      } catch (err) {
        postsContainer.innerHTML = "<p>Error loading posts.</p>";
      }
    }
  
    // Make deletePost globally accessible
    window.deletePost = async function (postId) {
      if (!confirm("Are you sure you want to delete this post?")) return;
  
      try {
        const res = await fetch(`http://localhost:3000/api/posts/${postId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (res.ok) {
          alert("Post deleted");
          loadAdminPosts();
        } else {
          alert("Failed to delete post");
        }
      } catch (err) {
        alert("Error deleting post");
      }
    };
  
    // Load posts on page load
    if (postsContainer) loadAdminPosts();
  });