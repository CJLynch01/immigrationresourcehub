import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function Messages() {
  const [me, setMe] = useState(null);

  const [activeTab, setActiveTab] = useState("inbox");

  const [clients, setClients] = useState([]);

  // compose
  const [to, setTo] = useState(""); // backend expects "to"
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // lists
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

      // if admin, load clients list (optional — only needed for admin compose dropdown)
      const role = (user?.role || "").toLowerCase();
      if (role === "admin") {
        loadClients();
      }
    } catch (e) {
      console.error("Failed to load me", e);
    }
  }

  async function loadClients() {
    try {
      const res = await fetch(`${API_BASE}/api/users`, { headers: authHeaders() });
      if (!res.ok) return;
      const users = await res.json().catch(() => []);
      // adjust filters to match your user model
      const clientUsers = (Array.isArray(users) ? users : []).filter(
        (u) => (u.role || "").toLowerCase() === "client"
      );
      setClients(clientUsers);
    } catch (e) {
      console.error("Failed to load clients", e);
    }
  }

  async function loadInbox() {
    setLoadingInbox(true);
    try {
      const res = await fetch(`${API_BASE}/api/messages/inbox`, { headers: authHeaders() });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || "Failed to load inbox");
      setInbox(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setInbox([]);
    } finally {
      setLoadingInbox(false);
    }
  }

  async function loadSent() {
    setLoadingSent(true);
    try {
      const res = await fetch(`${API_BASE}/api/messages/sent`, { headers: authHeaders() });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || "Failed to load sent messages");
      setSent(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setSent([]);
    } finally {
      setLoadingSent(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    setStatusMsg("");

    const role = (me?.role || "").toLowerCase();
    const isClient = role === "client";

    if (!subject.trim() || !body.trim()) {
      setStatusMsg("Please fill out subject and message.");
      return;
    }

    // Admin must pick a client
    if (!isClient && !to) {
      setStatusMsg("Please select a client.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          to: isClient ? undefined : to, // client can omit; backend overrides to ADMIN_ID_MONGODB
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatusMsg(data?.error || "Failed to send message.");
        return;
      }

      setStatusMsg(data?.msg || "Message sent ✅");
      setSubject("");
      setBody("");
      setTo("");

      await loadSent();
      setActiveTab("sent");
    } catch (e) {
      setStatusMsg("Network error sending message.");
    }
  }

  async function markRead(messageId) {
    try {
      const res = await fetch(`${API_BASE}/api/messages/${messageId}/read`, {
        method: "PUT",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to mark read");

      // update local UI
      setInbox((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isRead: true } : m))
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteMessage(messageId, where) {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/messages/${messageId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to delete");

      if (where === "inbox") setInbox((prev) => prev.filter((m) => m._id !== messageId));
      if (where === "sent") setSent((prev) => prev.filter((m) => m._id !== messageId));
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  function renderMessageCard(msg, where) {
    const fromName = msg?.from?.name || "Unknown";
    const toName = msg?.to?.name || "Unknown";
    const created = msg?.createdAt ? new Date(msg.createdAt).toLocaleString() : "";

    return (
      <div key={msg._id} className="message-card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <strong>{msg.subject}</strong>
          {created && <span style={{ opacity: 0.8, fontSize: 12 }}>{created}</span>}
        </div>

        <p style={{ marginTop: 6, marginBottom: 6 }}>{msg.body}</p>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 12, opacity: 0.85 }}>
            {where === "inbox" ? `From: ${fromName}` : `To: ${toName}`}
          </span>

          <div style={{ display: "flex", gap: 8 }}>
            {where === "inbox" && !msg.isRead && (
              <button type="button" className="button" onClick={() => markRead(msg._id)}>
                Mark Read
              </button>
            )}

            <button
              type="button"
              className="button"
              onClick={() => deleteMessage(msg._id, where)}
            >
              Delete
            </button>
          </div>
        </div>

        {where === "inbox" && msg.isRead === false ? (
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>Unread</div>
        ) : null}
      </div>
    );
  }

  const roleLower = (me?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";
  const isClient = roleLower === "client";

  return (
    <main className="messages-page">
      <h1>Messages</h1>

      <section className="new-message">
        <h2>New Message</h2>

        <form onSubmit={sendMessage}>
          {isAdmin && (
            <div id="recipientWrapper">
              <label htmlFor="recipientSelect">Select Client:</label>
              <select
                id="recipientSelect"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.email ? `(${c.email})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isClient && (
            <p style={{ opacity: 0.8 }}>
              Your message will be sent to the admin.
            </p>
          )}

          <label htmlFor="subject">Subject:</label>
          <input
            id="subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <label htmlFor="body">Message:</label>
          <textarea
            id="body"
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <button type="submit" className="button">
            Send Message
          </button>

          {statusMsg && <p>{statusMsg}</p>}
        </form>
      </section>

      <div className="message-tabs">
        <button
          id="inboxTab"
          className={activeTab === "inbox" ? "active" : ""}
          onClick={() => setActiveTab("inbox")}
          type="button"
        >
          Inbox
        </button>
        <button
          id="sentTab"
          className={activeTab === "sent" ? "active" : ""}
          onClick={() => setActiveTab("sent")}
          type="button"
        >
          Sent
        </button>
      </div>

      {activeTab === "inbox" && (
        <section className="received-messages" id="messagesListSection">
          <h2>Inbox</h2>
          {loadingInbox ? (
            <p>Loading inbox...</p>
          ) : inbox.length === 0 ? (
            <p>No messages.</p>
          ) : (
            <div id="messagesList">
              {inbox.map((m) => renderMessageCard(m, "inbox"))}
            </div>
          )}
        </section>
      )}

      {activeTab === "sent" && (
        <section className="sent-messages" id="sentMessagesSection">
          <h2>Sent</h2>
          {loadingSent ? (
            <p>Loading sent messages...</p>
          ) : sent.length === 0 ? (
            <p>No sent messages.</p>
          ) : (
            <div id="sentMessagesList">
              {sent.map((m) => renderMessageCard(m, "sent"))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}