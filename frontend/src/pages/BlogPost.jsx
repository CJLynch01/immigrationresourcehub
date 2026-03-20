import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useSEO({
    title: post?.title || "Blog",
    description: post?.excerpt || "Immigration insights, tips, and updates from Immigration Pathways Consulting.",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/posts/${id}`);
        if (!res.ok) throw new Error("Post not found.");
        setPost(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <main className="blog-post-page"><p>Loading...</p></main>;

  if (error) return (
    <main className="blog-post-page">
      <p style={{ color: "crimson" }}>{error}</p>
      <Link to="/blog" className="button">← Back to Blog</Link>
    </main>
  );

  return (
    <>
      <header className="site-header">
        <h1>{post.title}</h1>
        <p>
          {post.category && <span className="blog-category">{post.category}</span>}
          {post.date && (
            <span style={{ marginLeft: post.category ? "1rem" : 0, opacity: 0.75 }}>
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          )}
          {post.author?.name && (
            <span style={{ marginLeft: "1rem", opacity: 0.75 }}>by {post.author.name}</span>
          )}
        </p>
      </header>

      <main className="blog-post-page">
        <Link to="/blog" className="back-link">← Back to Blog</Link>

        <article
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #333" }}>
          <Link to="/blog" className="button">← Back to Blog</Link>
        </div>
      </main>
    </>
  );
}