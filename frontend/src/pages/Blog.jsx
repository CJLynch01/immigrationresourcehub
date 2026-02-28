import { useEffect, useState } from "react";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        // 👇 Change this to your real API endpoint if needed
        const res = await fetch("/api/blog/posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error loading posts:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  function getSortedPosts() {
    const sorted = [...posts];

    if (sortOption === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (sortOption === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    if (sortOption === "category") {
      sorted.sort((a, b) =>
        (a.category || "").localeCompare(b.category || "")
      );
    }

    return sorted;
  }

  return (
    <section>
      <header className="site-header">
        <h1>Immigration Insights & Updates</h1>
        <p>Stay informed with tips, updates, and guidance</p>
      </header>

      <main className="blog-page">
        <div className="blog-sort">
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

          {!loading && getSortedPosts().length === 0 && (
            <p>No posts yet.</p>
          )}

          {!loading &&
            getSortedPosts().map((post) => (
              <div className="blog-card" key={post.id}>
                <h2>{post.title}</h2>

                {post.category && (
                  <p className="blog-category">{post.category}</p>
                )}

                <p>
                  {post.excerpt ||
                    (post.content
                      ? post.content.substring(0, 200) + "..."
                      : "")}
                </p>
              </div>
            ))}
        </div>
      </main>
    </section>
  );
}