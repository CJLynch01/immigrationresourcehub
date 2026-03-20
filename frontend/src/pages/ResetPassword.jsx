import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }
      setMsg(data.msg || "Password updated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <h1>Reset Password</h1>
        <p>Choose a new password for your account</p>
      </header>

      <main className="login-page">
        <form onSubmit={handleSubmit} className="auth-form">
          {!token || error ? (
            <>
              <p className="form-message form-message--error">{error || "Invalid reset link."}</p>
              <p style={{ textAlign: "center", fontSize: "0.9rem" }}>
                <Link to="/forgot-password">Request a new reset link</Link>
              </p>
            </>
          ) : (
            <>
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />

              <label htmlFor="confirm">Confirm Password</label>
              <input
                type="password"
                id="confirm"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new password"
              />

              {error && <p className="form-message form-message--error">{error}</p>}
              {msg && <p className="form-message form-message--success">{msg}</p>}

              <button type="submit" className="button" disabled={loading || !!msg}>
                {loading ? "Saving..." : "Set New Password"}
              </button>
            </>
          )}
        </form>
      </main>
    </>
  );
}