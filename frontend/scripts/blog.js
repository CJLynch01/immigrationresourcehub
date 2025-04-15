// blog.js — fetch and display blog posts

document.addEventListener("DOMContentLoaded", () => {
    const postsContainer = document.getElementById("posts-container");
  
    if (postsContainer) {
      fetch("http://localhost:3000/api/posts")
        .then(res => res.json())
        .then(posts => {
          if (!Array.isArray(posts) || posts.length === 0) {
            postsContainer.innerHTML = "<p>No blog posts found.</p>";
            return;
          }
  
          postsContainer.innerHTML = posts.map(post => `
            <div class="post">
              <h3>${post.title}</h3>
              <p><strong>Category:</strong> ${post.category}</p>
              <p>${post.content}</p>
              <hr/>
            </div>
          `).join("");
        })
        .catch(err => {
          postsContainer.innerHTML = "<p>Error loading posts.</p>";
          console.error("Error fetching posts:", err);
        });
    }
  });