document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("blog-posts");

  try {
    const res = await fetch("http://localhost:3000/api/posts");
    const posts = await res.json();

    if (!posts.length) {
      container.innerHTML = "<p>No blog posts found.</p>";
      return;
    }

    container.innerHTML = posts
      .map(post => `
        <div class="blog-post">
          <h3>${post.title}</h3>
          <p><strong>Date:</strong> ${post.date}</p>
          <p><strong>Category:</strong> ${post.category}</p>
          <div class="blog-body">${marked.parse(post.content)}</div>
        </div>
      `)
      .join("");
  } catch (err) {
    console.error("Error fetching posts:", err);
    container.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
  }
});