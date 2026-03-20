import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const ROWS_PER_PAGE = 2;
const COLS = 2; // matches the CSS grid
const POSTS_PER_PAGE = ROWS_PER_PAGE * COLS; // 4 posts = 2 rows of 2

export default function Blog() {
  useSEO({
    title: "Immigration Insights & Updates",
    description: "Stay informed with immigration tips, policy updates, and guidance from Immigration Pathways Consulting.",
  });

  const [posts, setPosts] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [filterCategory, setFilterCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(posts.map((p) => p.category).filter(Boolean))];
    return unique.sort();
  }, [posts]);

  const sortedPosts = useMemo(() => {
    let filtered = filterCategory === "all" ? [...posts] : posts.filter((p) => p.category === filterCategory);

    if (sortOption === "newest") filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortOption === "oldest") filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortOption === "category") filtered.sort((a, b) => (a.category || "").localeCompare(b.category || ""));

    return filtered;
  }, [posts, sortOption, filterCategory]);

  // Reset to page 1 whenever filter or sort changes
  useMemo(() => { setPage(1); }, [sortOption, filterCategory]);

  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const pagedPosts = sortedPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  function excerptFrom(content) {
    if (!content) return "";
    const div = document.createElement("div");
    div.innerHTML = content;
    const text = (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
    return text.length > 200 ? text.substring(0, 200) + "..." : text;
  }

  return (
    <section>
      <header className="site-header">
        <h1>Immigration Insights & Updates</h1>
        <p>Stay informed with tips, updates, and guidance</p>
      </header>

      <main className="blog-page">
        <div className="blog-sort">
          <label htmlFor="filterCategory">Category:</label>
          <select
            id="filterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label htmlFor="sortPosts">Sort by:</label>
          <select
            id="sortPosts"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div className="blog-posts">
          {loading && <p>Loading posts...</p>}

          {!loading && sortedPosts.length === 0 && <p>No posts yet.</p>}

          {!loading &&
            pagedPosts.map((post) => (
              <div className="blog-card" key={post._id}>
                <h2>
                  <Link to={`/blog/${post._id}`}>{post.title}</Link>
                </h2>

                <div className="blog-meta">
                  {post.category && <span className="blog-category">{post.category}</span>}
                  {post.date && (
                    <span className="blog-date">
                      {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>

                <p className="blog-excerpt">{post.excerpt || excerptFrom(post.content)}</p>

                <Link className="button blog-read-more" to={`/blog/${post._id}`}>
                  Read More
                </Link>
              </div>
            ))}
        </div>

        {totalPages > 1 && (
          <div className="blog-pagination">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={n === page ? "active" : ""}
              >
                {n}
              </button>
            ))}
            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</button>
          </div>
        )}
      </main>
    </section>
  );
}