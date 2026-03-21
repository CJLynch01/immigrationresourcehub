import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminContacts() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/contact`, { headers: authHeaders() });
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.error || "Failed to load.");
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function markRead(id) {
    try {
      await fetch(`${API_BASE}/api/contact/${id}/read`, {
        method: "PUT",
        headers: authHeaders(),
      });
      setSubmissions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isRead: true } : s))
      );
    } catch { /* ignore */ }
  }

  function toggle(id) {
    setExpanded((prev) => (prev === id ? null : id));
    const sub = submissions.find((s) => s._id === id);
    if (sub && !sub.isRead) markRead(id);
  }

  const unread = submissions.filter((s) => !s.isRead).length;

  return (
    <>
      <header className="site-header">
        <h1>Contact Submissions</h1>
        <p>{unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "All caught up"}</p>
      </header>

      <main className="admin-dashboard">
        <section className="section">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: "crimson" }}>{error}</p>
          ) : submissions.length === 0 ? (
            <p>No contact submissions yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {submissions.map((s) => (
                <li
                  key={s._id}
                  style={{
                    background: "#2a2a2d",
                    borderRadius: "8px",
                    marginBottom: "0.75rem",
                    borderLeft: `4px solid ${s.isRead ? "#444" : "var(--accent-color)"}`,
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(s._id)}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      color: "inherit",
                      textAlign: "left",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: s.isRead ? 400 : 700, marginRight: "0.75rem" }}>
                        {s.name}
                      </span>
                      <span style={{ color: "#aaa", fontSize: "0.88rem" }}>{s.email}</span>
                    </div>
                    <span style={{ color: "#888", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {timeAgo(s.createdAt)}
                    </span>
                  </button>

                  {expanded === s._id && (
                    <div style={{ padding: "0 1rem 1rem" }}>
                      <p style={{ whiteSpace: "pre-wrap", color: "#ddd", lineHeight: 1.6 }}>{s.message}</p>
                      <a
                        href={`mailto:${s.email}?subject=Re: Your message to Immigration Pathways Consulting`}
                        className="button"
                        style={{ marginTop: "0.75rem", display: "inline-block" }}
                      >
                        Reply by Email
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
