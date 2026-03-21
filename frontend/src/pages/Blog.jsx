import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const POSTS_PER_PAGE = 6; // 3 cols x 2 rows

const CATEGORY_IMAGES = {
  "Breaking News":        "/images/blog/breaking-news.webp",
  "Immigration Updates":  "/images/blog/immigration-updates.webp",
  "Opinion":              "/images/blog/opinion.webp",
  "Business":             "/images/blog/business.webp",
  "Work Permit":          "/images/blog/work-permit.webp",
  "Family Petition":      "/images/blog/family-petition.webp",
  "Citizenship":          "/images/blog/citizenship.webp",
  "Asylum":               "/images/blog/asylum.webp",
  "Adjustment of Status": "/images/blog/adjustment-of-status.webp",
  "Consular Processing":  "/images/blog/consular-processing.webp",
  "Visa Services":        "/images/blog/visa-services.webp",
  "Student Visas":        "/images/blog/student-visas.webp",
  "Tourist Visas":        "/images/blog/tourist-visas.webp",
  "General Updates":      "/images/blog/general-updates.webp",
};
const DEFAULT_IMAGE = "/images/immigrant-world.webp";

function categoryImage(category) {
  return CATEGORY_IMAGES[category] || DEFAULT_IMAGE;
}

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
      } catch {
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

  useMemo(() => { setPage(1); }, [sortOption, filterCategory]);

  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const pagedPosts = sortedPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  function excerptFrom(content) {
    if (!content) return "";
    const div = document.createElement("div");
    div.innerHTML = content;
    const text = (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
    return text.length > 120 ? text.substring(0, 120) + "..." : text;
  }

  return (
    <section>
      <header className="site-header">
        <h1>Blog</h1>
        <p>Latest Updates &amp; Resources</p>
      </header>

      <main className="blog-page">
        <div className="blog-sort">
          <label htmlFor="filterCategory">Category:</label>
          <select id="filterCategory" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label htmlFor="sortPosts">Sort by:</label>
          <select id="sortPosts" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div className="blog-posts">
          {loading && <p>Loading posts...</p>}
          {!loading && sortedPosts.length === 0 && <p>No posts yet.</p>}
          {!loading && pagedPosts.map((post) => (
            <div className="blog-card" key={post._id}>
              <Link to={`/blog/${post._id}`} className="blog-card__image-link">
                <img
                  src={categoryImage(post.category)}
                  alt={post.category || "Blog"}
                  className="blog-card__image"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
                />
              </Link>

              <div className="blog-card__body">
                {post.category && <span className="blog-category">{post.category}</span>}

                <h2 className="blog-card__title">
                  <Link to={`/blog/${post._id}`}>{post.title}</Link>
                </h2>

                {post.date && (
                  <p className="blog-date">
                    {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                )}

                <p className="blog-excerpt">{post.excerpt || excerptFrom(post.content)}</p>

                <Link className="blog-read-more" to={`/blog/${post._id}`}>
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="blog-pagination">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={n === page ? "active" : ""}>{n}</button>
            ))}
            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>Next →</button>
          </div>
        )}
      </main>
    </section>
  );
}
