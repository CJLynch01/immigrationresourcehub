import { useState } from "react";
import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ForgotPassword() {
  useSEO({ title: "Forgot Password", description: "Reset your Immigration Pathways Consulting account password." });
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      setMsg(data.msg || "If that email exists, a reset link has been sent.");
      setSent(true);
    } catch {
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <h1>Forgot Password</h1>
        <p>Enter your email to receive a reset link</p>
      </header>

      <main className="login-page">
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={sent}
          />

          {msg && <p className={`form-message ${sent ? "form-message--success" : ""}`}>{msg}</p>}

          {!sent && (
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          )}

          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
            <Link to="/login">Back to Login</Link>
          </p>
        </form>
      </main>
    </>
  );
}