document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("blog-posts");
  const sortSelect = document.getElementById("sortPosts");

  async function loadPosts(sortBy = "newest") {
    try {
      const res = await fetch("http://localhost:3000/api/posts");
      let posts = await res.json();

      // Sort logic
      if (sortBy === "newest") {
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortBy === "oldest") {
        posts.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortBy === "category") {
        posts.sort((a, b) => a.category.localeCompare(b.category));
      }

      container.innerHTML = posts.length
  ? posts.map(post => `
    <div class="blog-card">
      <h3>${post.title}</h3>
      <p class="meta">${post.date} • ${post.category}</p>
      <div class="preview">${marked.parse(post.content.substring(0, 150))}...</div>
      <a href="post.html?id=${post._id}" class="read-more">Read More</a>
    </div>
  `).join("")
  : "<p>No blog posts found.</p>";
    } catch (err) {
      console.error("Error fetching posts:", err);
      container.innerHTML = "<p>Failed to load posts.</p>";
    }
  }

  sortSelect?.addEventListener("change", () => {
    loadPosts(sortSelect.value);
  });

  loadPosts();
});