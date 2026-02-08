import { requireRole, logout, getToken, showNavByAuth } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  requireRole("admin");
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

  const postsContainer = document.getElementById("admin-posts");
  const paginationContainer = document.getElementById("pagination");

  let allPosts = [];
  let currentPage = 1;
  const postsPerPage = 5;

  async function loadPosts() {
    if (!postsContainer) return;

    try {
      const res = await fetch("https://immigrationresourcehub.onrender.com/api/posts", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      allPosts = await res.json();
      renderPosts();
      renderPagination();
    } catch (err) {
      console.error("Error loading posts:", err);
      postsContainer.innerHTML = "<p>Failed to load blog posts.</p>";
    }
  }

  const postForm = document.getElementById("post-form");

  if (postForm) {
    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value.trim();
      const category = document.getElementById("category").value.trim();
      const content = document.getElementById("content").value.trim();
      const postDate = document.getElementById("postDate").value;

      const token = getToken();

      if (!title || !category || !content || !postDate) {
        alert("All fields are required.");
        return;
      }

      try {
        const res = await fetch("https://immigrationresourcehub.onrender.com/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            category,
            content,
            date: postDate
          })
        });

        const data = await res.json();

        if (res.ok) {
          alert("Post published successfully!");
          postForm.reset();
          loadPosts();
        } else {
          console.warn("Publish failed:", data);
          alert(data.error || "Failed to publish post.");
        }
      } catch (err) {
        console.error("Error publishing post:", err);
        alert("An error occurred while publishing the post.");
      }
    });
  }

  function renderPosts() {
    if (!postsContainer) return;

    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    const postsToShow = allPosts.slice(start, end);

    postsContainer.innerHTML = postsToShow.length
      ? postsToShow.map(post => `
          <div class="post" id="post-${post._id}">
            <h3 contenteditable="false" class="editable-title">${post.title}</h3>
            <p><strong>Date:</strong> <span contenteditable="false" class="editable-date">${post.date || "N/A"}</span></p>
            <p><strong>Category:</strong> <span contenteditable="false" class="editable-category">${post.category}</span></p>
            <div class="editable-content" contenteditable="false">${marked.parse(post.content)}</div>
            <button onclick="editPost('${post._id}')">✏️ Edit</button>
            <button onclick="deletePost('${post._id}')">🗑 Delete</button>
            <button onclick="savePost('${post._id}')" style="display:none;" id="save-${post._id}">💾 Save</button>
          </div>
        `).join("")
      : "<p>No blog posts yet.</p>";
  }

  function renderPagination() {
    if (!paginationContainer) return;
  
    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    paginationContainer.innerHTML = "";
  
    if (totalPages <= 1) return;
  
    // Page X of Y label
    const pageInfo = document.createElement("div");
    pageInfo.className = "page-info";
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationContainer.appendChild(pageInfo);
  
    // Previous button
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderPosts();
        renderPagination();
      }
    });
    paginationContainer.appendChild(prevButton);
  
    // Pagination with ellipsis
    const maxPagesToShow = 5;
  
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);
  
    if (currentPage === 1) endPage = Math.min(totalPages, 3);
    if (currentPage === totalPages) startPage = Math.max(1, totalPages - 2);
  
    // Always show first page
    if (startPage > 1) {
      addPageButton(1);
      if (startPage > 2) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.style.margin = "0 5px";
        paginationContainer.appendChild(dots);
      }
    }
  
    for (let page = startPage; page <= endPage; page++) {
      addPageButton(page);
    }
  
    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.style.margin = "0 5px";
        paginationContainer.appendChild(dots);
      }
      addPageButton(totalPages);
    }
  
    // Next button
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderPosts();
        renderPagination();
      }
    });
    paginationContainer.appendChild(nextButton);
  
    function addPageButton(page) {
      const button = document.createElement("button");
      button.textContent = page;
      if (page === currentPage) button.classList.add("active-page");
      button.addEventListener("click", () => {
        currentPage = page;
        renderPosts();
        renderPagination();
      });
      paginationContainer.appendChild(button);
    }
  }
  
  

  window.editPost = (id) => {
    const postEl = document.getElementById(`post-${id}`);
    postEl.querySelectorAll("[contenteditable]").forEach(el => el.contentEditable = true);
    postEl.querySelector(`#save-${id}`).style.display = "inline";
  };

  window.savePost = async (id) => {
    const postEl = document.getElementById(`post-${id}`);
    const title = postEl.querySelector(".editable-title").innerText.trim();
    const date = postEl.querySelector(".editable-date").innerText.trim();
    const category = postEl.querySelector(".editable-category").innerText.trim();
    const content = postEl.querySelector(".editable-content").innerText.trim();

    try {
      const res = await fetch(`https://immigrationresourcehub.onrender.com/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title, content, category, date })
      });

      if (res.ok) {
        alert("Post updated.");
        loadPosts();
      } else {
        alert("Failed to update post.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating post.");
    }
  };

  window.deletePost = async (id) => {
    if (!confirm("Delete this post?")) return;

    try {
      const res = await fetch(`https://immigrationresourcehub.onrender.com/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (res.ok) {
        alert("Post deleted.");
        loadPosts();
      } else {
        alert("Failed to delete post.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting post.");
    }
  };

  loadPosts();
});
