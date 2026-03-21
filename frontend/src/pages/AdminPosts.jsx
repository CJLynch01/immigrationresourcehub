import { useEffect, useState } from "react";
import RichTextEditor from "../components/RichTextEditor.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const CATEGORIES = [
  "Breaking News",
  "Immigration Updates",
  "Opinion",
  "Business",
  "Work Permit",
  "Family Petition",
  "Citizenship",
  "Asylum",
  "Adjustment of Status",
  "Consular Processing",
  "Visa Services",
  "Student Visas",
  "Tourist Visas",
  "General Updates",
];

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const POSTS_PER_PAGE = 5;

export default function AdminPosts() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState(1);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMsg, setEditMsg] = useState("");

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || `Server error (${res.status})`);
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setLoadError(e.message || "Failed to load posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ title, content, category, date }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage(data?.error || "Failed to publish post."); return; }
      setMessage("Post published ✅");
      setTitle("");
      setCategory("");
      setDate("");
      setContent("");
      await loadPosts();
    } catch (e) {
      setMessage(e.message || "Network error.");
    }
  }

  function startEdit(post) {
    setEditingId(post._id);
    setEditTitle(post.title || "");
    setEditCategory(post.category || "");
    setEditDate(toInputDate(post.date));
    setEditContent(post.content || "");
    setEditMsg("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditCategory("");
    setEditDate("");
    setEditContent("");
    setEditMsg("");
  }

  async function saveEdit() {
    setEditMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/posts/${editingId}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ title: editTitle, category: editCategory, date: editDate, content: editContent }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setEditMsg(data?.error || "Failed to update post."); return; }
      cancelEdit();
      await loadPosts();
    } catch (e) {
      setEditMsg(e.message || "Network error.");
    }
  }

  function excerptFrom(content) {
    if (!content) return "";
    const div = document.createElement("div");
    div.innerHTML = content;
    const text = (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  }

  async function deletePost(id) {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/posts/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setMessage(d?.error || "Delete failed."); return; }
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      setMessage(e.message || "Network error.");
    }
  }

  return (
    <>
      <header className="site-header">
        <h1>Admin Blog Management</h1>
        <p>Manage all blog posts here</p>
      </header>

      <main className="admin-dashboard">
        <section className="section">
          <h2>Create a New Blog Post</h2>
          <form className="blog-post-form" onSubmit={handleCreate}>

            <div className="blog-post-form__field blog-post-form__field--full">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
              />
            </div>

            <div className="blog-post-form__row">
              <div className="blog-post-form__field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">— Select a category —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="blog-post-form__field">
                <label htmlFor="postDate">Post Date</label>
                <input
                  type="date"
                  id="postDate"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="blog-post-form__field blog-post-form__field--full">
              <label>Content</label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>

            <div className="blog-post-form__footer">
              <button type="submit" className="blog-post-form__submit">
                Publish Post
              </button>
              {message && (
                <p className={message.includes("✅") ? "blog-post-form__msg--success" : "blog-post-form__msg--error"}>
                  {message}
                </p>
              )}
            </div>

          </form>
        </section>

        <section className="section">
          <h2>Existing Blog Posts</h2>

          {loading ? (
            <p>Loading posts...</p>
          ) : loadError ? (
            <p style={{ color: "crimson" }}>Error: {loadError}</p>
          ) : posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            <>
            <div id="admin-posts">
              {posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE).map((post) => {
                const isEditing = editingId === post._id;
                return (
                  <div key={post._id} className="admin-post-card" style={{ marginBottom: 16 }}>
                    {!isEditing ? (
                      <>
                        <h3>{post.title}</h3>
                        <p style={{ margin: "0.25rem 0 0.5rem", opacity: 0.75, fontSize: "0.9rem" }}>
                          <strong>{post.category}</strong>
                          {post.date ? ` — ${new Date(post.date).toLocaleDateString()}` : ""}
                          {post.author?.name ? <> — <em>{post.author.name}</em></> : null}
                        </p>
                        {post.content && (
                          <p style={{ margin: "0.5rem 0", lineHeight: 1.6, fontSize: "0.95rem" }}>
                            {excerptFrom(post.content)}
                          </p>
                        )}
                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                          <button type="button" className="button" onClick={() => startEdit(post)}>Edit</button>
                          <button type="button" className="button" onClick={() => deletePost(post._id)}>Delete</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3>Edit Post</h3>

                        <label>Title</label>
                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />

                        <label>Category</label>
                        <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                          <option value="">— Select a category —</option>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>

                        <label>Date</label>
                        <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />

                        <label>Content</label>
                        <RichTextEditor value={editContent} onChange={setEditContent} />

                        <div style={{ display: "flex", gap: 10, marginTop: "1rem" }}>
                          <button type="button" className="button" onClick={saveEdit}>Save</button>
                          <button type="button" className="button" onClick={cancelEdit}>Cancel</button>
                        </div>
                        {editMsg && <p>{editMsg}</p>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {Math.ceil(posts.length / POSTS_PER_PAGE) > 1 && (
              <div className="blog-pagination">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.ceil(posts.length / POSTS_PER_PAGE) }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)} className={n === page ? "active" : ""}>{n}</button>
                ))}
                <button onClick={() => setPage((p) => p + 1)} disabled={page === Math.ceil(posts.length / POSTS_PER_PAGE)}>›</button>
              </div>
            )}
            </>
          )}
        </section>
      </main>
    </>
  );
}