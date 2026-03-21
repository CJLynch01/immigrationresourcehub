import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/users/clients`, { headers: authHeaders() });
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.error || "Failed to load clients.");
        setClients(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id, name) {
    if (!confirm(`Remove client "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/clients/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data?.error || "Failed to remove client."); return; }
      setClients((prev) => prev.filter((c) => c._id !== id));
    } catch {
      alert("Network error.");
    }
  }

  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="site-header">
        <h1>Client Management</h1>
        <p>{clients.length} registered client{clients.length !== 1 ? "s" : ""}</p>
      </header>

      <main className="admin-dashboard">
        <section className="section">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1.5rem",
              background: "#1c1c1e",
              border: "1px solid #444",
              borderRadius: "6px",
              color: "#f8f8f8",
              fontSize: "0.95rem",
              boxSizing: "border-box",
            }}
          />

          {loading ? (
            <p>Loading clients...</p>
          ) : error ? (
            <p style={{ color: "crimson" }}>{error}</p>
          ) : filtered.length === 0 ? (
            <p>{search ? "No clients match your search." : "No clients registered yet."}</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--accent-color)", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem", color: "var(--accent-color)" }}>Name</th>
                  <th style={{ padding: "0.75rem", color: "var(--accent-color)" }}>Email</th>
                  <th style={{ padding: "0.75rem", color: "var(--accent-color)" }}>Registered</th>
                  <th style={{ padding: "0.75rem", color: "var(--accent-color)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c._id}
                    style={{
                      borderBottom: "1px solid #333",
                      background: i % 2 === 0 ? "#2a2a2d" : "transparent",
                    }}
                  >
                    <td style={{ padding: "0.75rem" }}>{c.name}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <a href={`mailto:${c.email}`}>{c.email}</a>
                    </td>
                    <td style={{ padding: "0.75rem", color: "#aaa", fontSize: "0.88rem" }}>
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td style={{ padding: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <a href={`mailto:${c.email}`} className="button" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>
                        Email
                      </a>
                      <button
                        type="button"
                        className="button"
                        style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem", background: "#7f1d1d", color: "#fff" }}
                        onClick={() => handleDelete(c._id, c.name)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}
