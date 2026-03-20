import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function MfaSetup() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [showSection, setShowSection] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verifyToken, setVerifyToken] = useState("");

  async function enableMfa() {
    setMsg("");
    setLoading(true);

    try {
      // ✅ You may need to adjust this endpoint to match your backend.
      // Common patterns:
      // - POST /api/auth/mfa/setup
      // - POST /api/auth/mfa/enable
      const res = await fetch(`${API_BASE}/api/auth/mfa/setup`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error || data?.msg || "Failed to start MFA setup.");
        return;
      }

      // Expecting something like:
      // { qrCode: "data:image/png;base64,..."} OR { qrCodeUrl: "..." }
      const qr = data?.qrCode || data?.qrCodeUrl || data?.qr || "";
      if (!qr) {
        setMsg("MFA setup started, but QR code was not returned by the server.");
        setShowSection(true);
        return;
      }

      setQrCodeUrl(qr);
      setShowSection(true);
      setMsg("Scan the QR code and enter the 6-digit code to verify.");
    } catch (e) {
      setMsg("Network error starting MFA setup.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyMfa() {
    setMsg("");
    const cleaned = verifyToken.replace(/\D/g, "").slice(0, 6);

    if (cleaned.length !== 6) {
      setMsg("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Your client code earlier used: POST /api/auth/mfa/verify
      const res = await fetch(`${API_BASE}/api/auth/mfa/verify`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ token: cleaned }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error || data?.msg || "MFA verification failed.");
        return;
      }

      setMsg(data?.msg || "MFA enabled successfully ✅");
      setVerifyToken("");
    } catch (e) {
      setMsg("Network error verifying MFA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Multi-Factor Authentication</h1>
      <p>Secure your account by enabling MFA.</p>

      <button
        id="enableMFAButton"
        className="button"
        type="button"
        onClick={enableMfa}
        disabled={loading}
      >
        {loading ? "Working..." : "Enable MFA"}
      </button>

      {msg && <p>{msg}</p>}

      {showSection && (
        <div id="mfaSection" style={{ display: "block" }}>
          <p>Scan this QR code with your authenticator app:</p>

          {qrCodeUrl ? (
            <img id="qrCode" src={qrCodeUrl} alt="MFA QR Code" />
          ) : (
            <p>(QR code not available)</p>
          )}

          <p>Then enter the 6-digit code to verify.</p>

          <input
            type="text"
            id="verifyToken"
            placeholder="123456"
            value={verifyToken}
            onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
          />

          <button
            id="verifyButton"
            className="button"
            type="button"
            onClick={verifyMfa}
            disabled={loading}
          >
            Verify MFA
          </button>
        </div>
      )}
    </>
  );
}