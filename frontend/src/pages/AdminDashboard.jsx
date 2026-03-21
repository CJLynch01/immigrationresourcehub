import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function getToken() {
  return localStorage.getItem("token") || "";
}

async function apiJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export default function AdminDashboard() {
  // docs
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState("");
  const [allDocs, setAllDocs] = useState([]);

  // quiz scores
  const [quizResults, setQuizResults] = useState([]);

  // send form
  const [clients, setClients] = useState([]); // optional: wire to your real clients endpoint
  const [selectedClientId, setSelectedClientId] = useState("");
  const [docType, setDocType] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("dashboard"); // your backend still expects this
  const [file, setFile] = useState(null);
  const [sendMsg, setSendMsg] = useState("");

  // derived lists
  const clientDocuments = useMemo(
    () => allDocs.filter((d) => d.sentByAdmin === false),
    [allDocs]
  );

  const adminDocuments = useMemo(
    () => allDocs.filter((d) => d.sentByAdmin === true),
    [allDocs]
  );

  async function loadAllDocs() {
    setDocsError("");
    setDocsLoading(true);
    try {
      const docs = await apiJson("/api/uploads");
      setAllDocs(Array.isArray(docs) ? docs : []);
    } catch (e) {
      setDocsError(e.message);
    } finally {
      setDocsLoading(false);
    }
  }

  useEffect(() => {
    loadAllDocs();
    apiJson("/api/users/clients").then(setClients).catch(() => {});
    apiJson("/api/quiz/admin/all-results").then(setQuizResults).catch(() => {});
  }, []);

  async function openDoc(doc) {
    // your signed-url expects the S3 key, which you currently extract from s3Url in delete
    const key = doc?.s3Url?.split(".amazonaws.com/")[1];
    if (!key) return alert("Missing S3 key for this document.");

    try {
      const { url } = await apiJson(`/api/uploads/signed-url/${key}`);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert(e.message);
    }
  }

  async function deleteDoc(docId) {
    if (!confirm("Delete this document?")) return;

    try {
      await apiJson(`/api/uploads/${docId}`, { method: "DELETE" });
      // refresh list
      setAllDocs((prev) => prev.filter((d) => d._id !== docId));
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    setSendMsg("");

    if (!selectedClientId) return setSendMsg("Select a client (userId).");
    if (!docType.trim()) return setSendMsg("Enter a document type.");
    if (!file) return setSendMsg("Choose a PDF file.");

    try {
      const form = new FormData();
      form.append("userId", selectedClientId);
      form.append("docType", docType);
      form.append("deliveryMethod", deliveryMethod); // backend checks this
      form.append("file", file);

      const res = await fetch(`${API_BASE}/api/uploads/admin-send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          // DO NOT set Content-Type when using FormData
        },
        body: form,
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error(data?.error || data?.message || "Send failed");

      setSendMsg(data?.msg || "Sent ✅");
      setDocType("");
      setFile(null);

      // refresh docs so the "Uploaded To Clients" section updates
      await loadAllDocs();
    } catch (e) {
      setSendMsg(e.message);
    }
  }

  return (
    <>
      <header className="site-header">
        <h1>Admin Dashboard</h1>
        <p>Manage content and client documents</p>
      </header>

      <main className="admin-dashboard">
        <section className="section">
          <h2>📤 Documents From Clients</h2>

          {docsLoading ? (
            <p>Loading documents...</p>
          ) : docsError ? (
            <p style={{ color: "crimson" }}>{docsError}</p>
          ) : clientDocuments.length === 0 ? (
            <p>No client documents yet.</p>
          ) : (
            <ul>
              {clientDocuments.map((d) => (
                <li key={d._id}>
                  <div>
                    <strong>{d.docType}</strong>{" "}
                    <span>— {d.filename}</span>
                    {d.userId?.email && (
                      <span> (from {d.userId.email})</span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <button type="button" className="button" onClick={() => openDoc(d)}>
                      View
                    </button>
                    <button type="button" className="button" onClick={() => deleteDoc(d._id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <h2>📂 Documents Uploaded To Clients</h2>

          {docsLoading ? (
            <p>Loading documents...</p>
          ) : docsError ? (
            <p style={{ color: "crimson" }}>{docsError}</p>
          ) : adminDocuments.length === 0 ? (
            <p>No admin-uploaded documents yet.</p>
          ) : (
            <ul>
              {adminDocuments.map((d) => (
                <li key={d._id}>
                  <div>
                    <strong>{d.docType}</strong>{" "}
                    <span>— {d.filename}</span>
                    {d.userId?.email && (
                      <span> (to {d.userId.email})</span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <button type="button" className="button" onClick={() => openDoc(d)}>
                      View
                    </button>
                    <button type="button" className="button" onClick={() => deleteDoc(d._id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <h2>🏆 Client Quiz Scores</h2>
          {quizResults.length === 0 ? (
            <p>No quiz results yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {quizResults.map((r) => (
                <li key={r._id} style={{ background: "#2a2a2d", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "0.5rem", borderLeft: "3px solid var(--accent-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>
                    <strong>{r.userId?.name || "Unknown"}</strong>
                    <span style={{ color: "#aaa", fontSize: "0.85rem" }}> ({r.userId?.email})</span>
                    {" — "}
                    <strong>{r.score}/{r.totalQuestions}</strong> ({Math.round((r.score / r.totalQuestions) * 100)}%)
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#888" }}>{new Date(r.date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <h2>📤 Send File to Client</h2>

          <form className="admin-form" onSubmit={handleSend}>
            {/* If you don’t have a clients endpoint yet, just type/paste userId */}
            <label htmlFor="userId">Select Client</label>
            <select
              id="userId"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              required
            >
              <option value="">— Choose a client —</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>

            <label htmlFor="docType">Document Type</label>
            <input
              type="text"
              id="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              placeholder="e.g. Welcome Letter"
              required
            />

            <label htmlFor="deliveryMethod">Delivery Method</label>
            <select
              id="deliveryMethod"
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
            >
              <option value="dashboard">Dashboard</option>
              <option value="email">Email</option>
            </select>

            <label htmlFor="adminFile">Choose File (PDF)</label>
            <input
              type="file"
              id="adminFile"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />

            <button type="submit" className="button">
              📨 Send
            </button>

            {sendMsg && <p>{sendMsg}</p>}
          </form>
        </section>
      </main>
    </>
  );
}
