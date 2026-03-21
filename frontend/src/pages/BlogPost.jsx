import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [prev, setPrev] = useState(null);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useSEO({
    title: post?.title || "Blog",
    description: post?.excerpt || "Immigration insights, tips, and updates from Immigration Pathways Consulting.",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      setPrev(null);
      setNext(null);
      try {
        const [postRes, allRes] = await Promise.all([
          fetch(`${API_BASE}/api/posts/${id}`),
          fetch(`${API_BASE}/api/posts`),
        ]);
        if (!postRes.ok) throw new Error("Post not found.");
        const postData = await postRes.json();
        setPost(postData);

        if (allRes.ok) {
          const all = await allRes.json();
          if (Array.isArray(all)) {
            const sorted = [...all].sort((a, b) => new Date(b.date) - new Date(a.date));
            const idx = sorted.findIndex((p) => p._id === id);
            if (idx > 0) setNext(sorted[idx - 1]);
            if (idx < sorted.length - 1) setPrev(sorted[idx + 1]);
          }
        }
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
      <Link to="/blog" className="back-link">← Back to Blog</Link>
    </main>
  );

  return (
    <main className="blog-post-page">
      <Link to="/blog" className="back-link">← Back to Blog</Link>

      <article className="blog-post-article">
        <h1 className="blog-post-article__title">{post.title}</h1>

        <div className="blog-post-article__meta">
          {post.date && (
            <span>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
          )}
          {post.author?.name && (
            <>
              <span className="blog-post-article__meta-divider">|</span>
              <span>By: {post.author.name}</span>
            </>
          )}
          {post.category && <span className="blog-category">{post.category}</span>}
        </div>

        <hr className="blog-post-article__rule" />

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <div className="blog-post-nav">
        {prev ? (
          <Link to={`/blog/${prev._id}`} className="blog-post-nav__btn">
            ← Previous
          </Link>
        ) : <span />}
        {next ? (
          <Link to={`/blog/${next._id}`} className="blog-post-nav__btn">
            Next →
          </Link>
        ) : <span />}
      </div>
    </main>
  );
}
