import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Register() {
  useSEO({
    title: "Create an Account",
    description: "Register for a client account with Immigration Pathways Consulting to access your dashboard and documents.",
  });

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

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
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.msg || "Registration failed. Please try again.");
        return;
      }

      navigate("/login", { state: { registered: true } });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <h1>Create an Account</h1>
        <p>Register to access your client dashboard</p>
      </header>

      <main className="login-page">
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            autoComplete="name"
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />

          <label htmlFor="confirm">Confirm Password</label>
          <input
            type="password"
            id="confirm"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
          />

          {error && <p className="form-message form-message--error">{error}</p>}

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </main>
    </>
  );
}
