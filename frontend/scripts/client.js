document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
  
    // Check token
    if (!token) {
      alert("Access denied. Please log in.");
      window.location.href = "login.html";
      return;
    }
  
    // Decode token
    let payload;
    try {
      payload = JSON.parse(atob(token.split('.')[1]));
    } catch {
      alert("Invalid token.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }
  
    if (payload.role !== "client") {
      alert("Client access only.");
      window.location.href = "login.html";
      return;
    }
  
    // ✅ Toggle login/logout nav
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
  
    // ✅ Load blog posts or client dashboard content here
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