document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("single-post");
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
  
    if (!postId) {
      container.innerHTML = "<p>Post not found.</p>";
      return;
    }
  
    try {
      const res = await fetch(`https://immigrationresourcehub.onrender.com/api/posts/${postId}`);
      const post = await res.json();
  
      container.innerHTML = `
        <article class="blog-post">
          <h2>${post.title}</h2>
          <p><strong>Date:</strong> ${post.date}</p>
          <p><strong>Category:</strong> ${post.category}</p>
          <div>${marked.parse(post.content)}</div>
        </article>
      `;
    } catch (err) {
      container.innerHTML = "<p>Error loading post.</p>";
      console.error(err);
    }
  });