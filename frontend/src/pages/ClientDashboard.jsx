import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Client() {
  const [me, setMe] = useState(null);

  // MFA
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaVerify, setShowMfaVerify] = useState(false);
  const [verifyMfaToken, setVerifyMfaToken] = useState("");
  const [mfaVerifyMsg, setMfaVerifyMsg] = useState("");

  // Messaging
  const [inbox, setInbox] = useState([]);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgStatus, setMsgStatus] = useState("");

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // Upload + docs
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState("");

  // Docs split
  const [myDocs, setMyDocs] = useState([]);      // client-uploaded
  const [adminDocs, setAdminDocs] = useState([]); // admin-sent
  const [loadingDocs, setLoadingDocs] = useState(true);

  const tokenExists = !!localStorage.getItem("token");

  // Load current user
  useEffect(() => {
    async function loadMe() {
      if (!tokenExists) return;

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { ...authHeaders() },
        });
        if (!res.ok) throw new Error("Failed to load profile.");

        // Depending on your backend, this might be { user: {...} } or the user object.
        const data = await res.json();
        const user = data?.user ?? data; // supports both shapes
        setMe(user);

        // Your User model uses user.mfa.enabled
        const enabled = !!user?.mfa?.enabled;
        setMfaEnabled(enabled);

        // Show verify section if a secret exists but MFA isn't enabled yet
        setShowMfaVerify(!enabled && !!user?.mfa?.secret);
      } catch (e) {
        // If token is bad/expired, force logout
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    loadMe();
  }, [tokenExists]);

  // Load docs using your real uploads route
  useEffect(() => {
    async function loadDocs() {
      if (!tokenExists) return;

      setLoadingDocs(true);
      try {
        const res = await fetch(`${API_BASE}/api/uploads/my-uploads`, {
          headers: { ...authHeaders() },
        });
        if (!res.ok) throw new Error("Failed to load documents.");
        const docs = await res.json();

        // Split by sentByAdmin flag
        const mine = Array.isArray(docs) ? docs.filter((d) => d.sentByAdmin === false) : [];
        const fromAdmin = Array.isArray(docs) ? docs.filter((d) => d.sentByAdmin === true) : [];

        setMyDocs(mine);
        setAdminDocs(fromAdmin);
      } catch (e) {
        setMyDocs([]);
        setAdminDocs([]);
      } finally {
        setLoadingDocs(false);
      }
    }

    loadDocs();
  }, [tokenExists]);

  // Load inbox
  useEffect(() => {
    async function loadInbox() {
      if (!tokenExists) return;
      try {
        const res = await fetch(`${API_BASE}/api/messages/inbox`, { headers: { ...authHeaders() } });
        if (!res.ok) return;
        const data = await res.json();
        setInbox(Array.isArray(data) ? data : []);
      } catch { /* ignore */ }
    }
    loadInbox();
  }, [tokenExists]);

  async function handleSendMessage(e) {
    e.preventDefault();
    setMsgStatus("");
    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ subject: msgSubject, body: msgBody }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsgStatus(data?.error || "Failed to send."); return; }
      setMsgStatus("Message sent!");
      setMsgSubject("");
      setMsgBody("");
    } catch { setMsgStatus("Network error."); }
  }

  async function handleVerifyMfa() {
    setMfaVerifyMsg("");

    const cleaned = verifyMfaToken.replace(/\D/g, "").slice(0, 6);
    if (cleaned.length !== 6) {
      setMfaVerifyMsg("Please enter a valid 6-digit code.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/mfa/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ token: cleaned }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMfaVerifyMsg(data?.error || data?.msg || "MFA verification failed.");
        return;
      }

      setMfaVerifyMsg(data?.msg || "MFA enabled successfully.");
      setMfaEnabled(true);
      setShowMfaVerify(false);

      // Refresh profile
      const meRes = await fetch(`${API_BASE}/api/auth/me`, { headers: { ...authHeaders() } });
      if (meRes.ok) {
        const freshData = await meRes.json();
        const freshUser = freshData?.user ?? freshData;
        setMe(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      }
    } catch (e) {
      setMfaVerifyMsg("Network error verifying MFA.");
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordMessage("");

    if (!currentPassword || !newPassword) {
      setPasswordMessage("Please fill out both password fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPasswordMessage(data?.msg || data?.error || "Failed to update password.");
        return;
      }

      setPasswordMessage(data?.msg || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setPasswordMessage("Network error updating password.");
    }
  }

  async function viewDoc(doc) {
    const key = doc?.s3Url?.split(".amazonaws.com/")[1];
    if (!key) return;

    try {
      const res = await fetch(`${API_BASE}/api/uploads/signed-url/${key}`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // ignore
    }
  }

  async function refreshDocs() {
    try {
      const res = await fetch(`${API_BASE}/api/uploads/my-uploads`, {
        headers: { ...authHeaders() },
      });
      if (!res.ok) return;
      const docs = await res.json();

      const mine = Array.isArray(docs) ? docs.filter((d) => d.sentByAdmin === false) : [];
      const fromAdmin = Array.isArray(docs) ? docs.filter((d) => d.sentByAdmin === true) : [];

      setMyDocs(mine);
      setAdminDocs(fromAdmin);
    } catch {
      // ignore
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setUploadMsg("");

    if (!docType.trim() || !file) {
      setUploadMsg("Please provide a document type and choose a file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("docType", docType.trim());
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/uploads`, {
        method: "POST",
        headers: {
          ...authHeaders(), // don't set content-type with FormData
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUploadMsg(data?.msg || data?.error || "Upload failed.");
        return;
      }

      setUploadMsg(data?.msg || "Upload successful.");
      setDocType("");
      setFile(null);

      await refreshDocs();
    } catch (e) {
      setUploadMsg("Network error uploading document.");
    }
  }

  return (
    <>
      <header className="site-header">
        <h1>Client Dashboard</h1>

        <div id="mfaStatus" className="mfa-status">
          {mfaEnabled ? "✅ MFA is enabled on your account." : "⚠️ MFA is not enabled."}
        </div>

        {showMfaVerify && (
          <section id="mfaVerifySection">
            <h2>🔐 Verify MFA Setup</h2>
            <p>Enter the 6-digit code from your authenticator app:</p>

            <input
              type="text"
              id="verifyMfaToken"
              placeholder="123456"
              inputMode="numeric"
              value={verifyMfaToken}
              onChange={(e) =>
                setVerifyMfaToken(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />

            <button type="button" id="verifyMfaBtn" className="button" onClick={handleVerifyMfa}>
              Verify MFA
            </button>

            <p id="mfaVerifyMsg">{mfaVerifyMsg}</p>
          </section>
        )}

        <p>Welcome{me?.name ? `, ${me.name}` : ""} to your personalized hub</p>
      </header>

      <main className="client-dashboard">
        <section className="password-card">
          <h3>Change Password</h3>
          <form id="changePasswordForm" onSubmit={handleChangePassword}>
            <label htmlFor="currentPassword">Current Password:</label>
            <input
              type="password"
              id="currentPassword"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button type="submit">Update Password</button>
            <p id="passwordMessage">{passwordMessage}</p>
          </form>
        </section>

        <section className="section">
          <h2>📄 Upload a Document</h2>
          <form id="uploadForm" onSubmit={handleUpload} encType="multipart/form-data">
            <label htmlFor="docType">Document Type</label>
            <input
              type="text"
              name="docType"
              id="docType"
              placeholder="e.g. Work Permit Application"
              required
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            />

            <label htmlFor="file">Choose File</label>
            <input
              type="file"
              name="file"
              id="file"
              accept=".pdf"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <button type="submit" className="button">
              Upload
            </button>

            {uploadMsg && <p className="form-message">{uploadMsg}</p>}
          </form>
        </section>

        <section className="section">
          <h2>📁 Your Documents</h2>
          <div id="my-uploaded-docs">
            {loadingDocs ? (
              <p>Loading documents...</p>
            ) : myDocs?.length ? (
              <ul>
                {myDocs.map((d) => (
                  <li key={d._id || d.id}>
                    <span>{d.docType || d.name || "Document"}</span>{" "}
                    {d.filename ? <span>— {d.filename}</span> : null}{" "}
                    <button type="button" className="button" onClick={() => viewDoc(d)}>
                      View
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No documents uploaded yet.</p>
            )}
          </div>
        </section>

        <section className="section">
          <h2>📥 Documents From Admin</h2>
          <div id="admin-sent-docs">
            {loadingDocs ? (
              <p>Loading documents...</p>
            ) : adminDocs?.length ? (
              <ul>
                {adminDocs.map((d) => (
                  <li key={d._id || d.id}>
                    <span>{d.docType || d.name || "Document"}</span>{" "}
                    {d.filename ? <span>— {d.filename}</span> : null}{" "}
                    <button type="button" className="button" onClick={() => viewDoc(d)}>
                      View
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No documents from admin yet.</p>
            )}
          </div>
        </section>

        <section className="section">
          <h2>✉️ Message Admin</h2>
          <form onSubmit={handleSendMessage}>
            <label htmlFor="msgSubject">Subject</label>
            <input
              type="text"
              id="msgSubject"
              required
              value={msgSubject}
              onChange={(e) => setMsgSubject(e.target.value)}
              placeholder="e.g. Question about my application"
            />
            <label htmlFor="msgBody">Message</label>
            <textarea
              id="msgBody"
              rows={4}
              required
              value={msgBody}
              onChange={(e) => setMsgBody(e.target.value)}
              placeholder="Type your message here..."
              style={{ width: "100%", padding: "0.75rem", background: "#1c1c1e", color: "#f8f8f8", border: "1px solid #444", borderRadius: "5px", marginBottom: "1rem" }}
            />
            {msgStatus && <p className={`form-message ${msgStatus === "Message sent!" ? "form-message--success" : "form-message--error"}`}>{msgStatus}</p>}
            <button type="submit" className="button">Send Message</button>
          </form>

          {inbox.length > 0 && (
            <>
              <h3 style={{ marginTop: "2rem" }}>Inbox</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {inbox.map((m) => (
                  <li key={m._id} style={{ background: "#2a2a2d", borderRadius: "6px", padding: "1rem", marginBottom: "0.75rem", borderLeft: `3px solid ${m.isRead ? "#555" : "var(--accent-color)"}` }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{m.subject}</p>
                    <p style={{ margin: "0.4rem 0", fontSize: "0.9rem", color: "#ccc" }}>{m.body}</p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>{new Date(m.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
    </>
  );
}