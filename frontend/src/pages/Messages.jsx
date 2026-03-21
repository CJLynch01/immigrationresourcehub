import { useEffect, useState } from "react";
import useSEO from "../hooks/useSEO.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export default function Messages() {
  useSEO({ title: "Messages", description: "Internal messaging for Immigration Pathways Consulting clients and admin." });

  const [me, setMe] = useState(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const [clients, setClients] = useState([]);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState(""); // "success" | "error"

  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingSent, setLoadingSent] = useState(true);

  useEffect(() => {
    loadMeAndMaybeClients();
    loadInbox();
    loadSent();
  }, []);

  async function loadMeAndMaybeClients() {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      const user = data?.user ?? data;
      setMe(user);
      if ((user?.role || "").toLowerCase() === "admin") loadClients();
    } catch { /* ignore */ }
  }

  async function loadClients() {
    try {
      const res = await fetch(`${API_BASE}/api/users/clients`, { headers: authHeaders() });
      if (!res.ok) return;
      const users = await res.json().catch(() => []);
      setClients(Array.isArray(users) ? users : []);
    } catch { /* ignore */ }
  }

  async function loadInbox() {
    setLoadingInbox(true);
    try {
      const res = await fetch(`${API_BASE}/api/messages/inbox`, { headers: authHeaders() });
      const data = await res.json().catch(() => []);
      setInbox(res.ok && Array.isArray(data) ? data : []);
    } catch { setInbox([]); }
    finally { setLoadingInbox(false); }
  }

  async function loadSent() {
    setLoadingSent(true);
    try {
      const res = await fetch(`${API_BASE}/api/messages/sent`, { headers: authHeaders() });
      const data = await res.json().catch(() => []);
      setSent(res.ok && Array.isArray(data) ? data : []);
    } catch { setSent([]); }
    finally { setLoadingSent(false); }
  }

  async function sendMessage(e) {
    e.preventDefault();
    setStatusMsg("");
    const isClient = (me?.role || "").toLowerCase() === "client";
    if (!isClient && !to) { setStatusMsg("Please select a client."); setStatusType("error"); return; }

    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ to: isClient ? undefined : to, subject: subject.trim(), body: body.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setStatusMsg(data?.error || "Failed to send."); setStatusType("error"); return; }
      setStatusMsg("Message sent successfully.");
      setStatusType("success");
      setSubject(""); setBody(""); setTo("");
      await loadSent();
      setTimeout(() => { setActiveTab("sent"); setStatusMsg(""); }, 1200);
    } catch { setStatusMsg("Network error. Please try again."); setStatusType("error"); }
  }

  function handleReply(msg) {
    setTo(msg.from?._id || "");
    setSubject(msg.subject?.startsWith("Re: ") ? msg.subject : `Re: ${msg.subject}`);
    setBody("");
    setStatusMsg("");
    setActiveTab("compose");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function markRead(id) {
    try {
      await fetch(`${API_BASE}/api/messages/${id}/read`, { method: "PUT", headers: authHeaders() });
      setInbox((prev) => prev.map((m) => (m._id === id ? { ...m, isRead: true } : m)));
    } catch { /* ignore */ }
  }

  async function deleteMessage(id, where) {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/messages/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) return;
      if (where === "inbox") setInbox((prev) => prev.filter((m) => m._id !== id));
      if (where === "sent") setSent((prev) => prev.filter((m) => m._id !== id));
    } catch { /* ignore */ }
  }

  const isAdmin = (me?.role || "").toLowerCase() === "admin";
  const isClient = (me?.role || "").toLowerCase() === "client";
  const unreadCount = inbox.filter((m) => !m.isRead).length;

  function MessageCard({ msg, where }) {
    const fromName = msg?.from?.name || "Unknown";
    const toName = msg?.to?.name || "Unknown";
    const date = msg?.createdAt ? new Date(msg.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";
    const isUnread = where === "inbox" && !msg.isRead;

    return (
      <div className={`msg-card${isUnread ? " msg-card--unread" : ""}`}>
        <div className="msg-card__header">
          <div className="msg-card__meta">
            {isUnread && <span className="msg-badge">New</span>}
            <span className="msg-card__from">
              {where === "inbox" ? `From: ${fromName}` : `To: ${toName}`}
            </span>
          </div>
          <span className="msg-card__date">{date}</span>
        </div>

        <p className="msg-card__subject">{msg.subject}</p>
        <p className="msg-card__body">{msg.body}</p>

        <div className="msg-card__actions">
          {where === "inbox" && (
            <button type="button" className="button msg-btn" onClick={() => handleReply(msg)}>
              Reply
            </button>
          )}
          {isUnread && (
            <button type="button" className="msg-btn msg-btn--secondary" onClick={() => markRead(msg._id)}>
              Mark Read
            </button>
          )}
          <button type="button" className="msg-btn msg-btn--danger" onClick={() => deleteMessage(msg._id, where)}>
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="site-header">
        <h1>Messages</h1>
        <p>{isAdmin ? "Manage client communications" : "Communicate with your consultant"}</p>
      </header>

      <main className="messages-page">

        {/* Tabs */}
        <div className="msg-tabs">
          <button
            className={`msg-tab${activeTab === "compose" ? " msg-tab--active" : ""}`}
            onClick={() => setActiveTab("compose")}
            type="button"
          >
            ✏️ Compose
          </button>
          <button
            className={`msg-tab${activeTab === "inbox" ? " msg-tab--active" : ""}`}
            onClick={() => setActiveTab("inbox")}
            type="button"
          >
            📥 Inbox
            {unreadCount > 0 && <span className="msg-tab-badge">{unreadCount}</span>}
          </button>
          <button
            className={`msg-tab${activeTab === "sent" ? " msg-tab--active" : ""}`}
            onClick={() => setActiveTab("sent")}
            type="button"
          >
            📤 Sent
          </button>
        </div>

        {/* Compose */}
        {activeTab === "compose" && (
          <section className="msg-section">
            <h2 className="msg-section__title">New Message</h2>
            <form className="msg-form" onSubmit={sendMessage}>
              {isAdmin && (
                <div className="msg-form__field">
                  <label htmlFor="recipientSelect">To</label>
                  <select
                    id="recipientSelect"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                  >
                    <option value="">— Select a client —</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {isClient && (
                <p className="msg-form__note">Your message will be sent to your consultant.</p>
              )}
              <div className="msg-form__field">
                <label htmlFor="msgSubject">Subject</label>
                <input
                  id="msgSubject"
                  type="text"
                  required
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="msg-form__field">
                <label htmlFor="msgBody">Message</label>
                <textarea
                  id="msgBody"
                  required
                  rows={6}
                  placeholder="Write your message here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              {statusMsg && (
                <p className={`form-message ${statusType === "success" ? "form-message--success" : "form-message--error"}`}>
                  {statusMsg}
                </p>
              )}
              <button type="submit" className="button">Send Message</button>
            </form>
          </section>
        )}

        {/* Inbox */}
        {activeTab === "inbox" && (
          <section className="msg-section">
            <h2 className="msg-section__title">
              Inbox {unreadCount > 0 && <span className="msg-section__badge">{unreadCount} unread</span>}
            </h2>
            {loadingInbox ? (
              <p className="msg-empty">Loading messages...</p>
            ) : inbox.length === 0 ? (
              <p className="msg-empty">Your inbox is empty.</p>
            ) : (
              <div className="msg-list">
                {inbox.map((m) => <MessageCard key={m._id} msg={m} where="inbox" />)}
              </div>
            )}
          </section>
        )}

        {/* Sent */}
        {activeTab === "sent" && (
          <section className="msg-section">
            <h2 className="msg-section__title">Sent</h2>
            {loadingSent ? (
              <p className="msg-empty">Loading sent messages...</p>
            ) : sent.length === 0 ? (
              <p className="msg-empty">No sent messages yet.</p>
            ) : (
              <div className="msg-list">
                {sent.map((m) => <MessageCard key={m._id} msg={m} where="sent" />)}
              </div>
            )}
          </section>
        )}

      </main>
    </>
  );
}
