import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(""); // MFA code

  const [showMfa, setShowMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function fetchMe(jwtToken) {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch user profile.");
    return res.json();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const payload = { email, password };
      // only send MFA token if the field is visible / user entered it
      if (showMfa) payload.token = token;

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      // MFA required case (your backend uses 206)
      if (res.status === 206 && data?.mfaRequired) {
        setShowMfa(true);
        setMsg(data?.msg || "MFA code required.");
        return;
      }

      // Other errors
      if (!res.ok) {
        setMsg(data?.msg || "Login failed. Please try again.");
        return;
      }

      // Success: { token: jwtToken }
      const jwtToken = data?.token;
      if (!jwtToken) {
        setMsg("Login succeeded but no token was returned.");
        return;
      }

      localStorage.setItem("token", jwtToken);

      // Pull /me so we can route based on role
      const me = await fetchMe(jwtToken);
      localStorage.setItem("user", JSON.stringify(me));

      // Your roles appear to be "client" and admin-ish roles
      // Adjust to match your exact roles: "admin", "employee", etc.
      const role = (me?.role || "").toLowerCase();

      if (role === "admin" || role === "employee") {
        navigate("/admin");
      } else {
        navigate("/client");
      }
    } catch (err) {
      setMsg(err?.message || "Network/server error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <h1>Login</h1>
        <p>Access your dashboard</p>
      </header>

      <main className="login-page">
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {showMfa && (
            <div id="mfaField">
              <label htmlFor="mfaToken">MFA Code</label>
              <input
                type="text"
                id="mfaToken"
                inputMode="numeric"
                placeholder="123456"
                value={token}
                onChange={(e) =>
                  setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
              />
            </div>
          )}

          {msg && <p className="form-message">{msg}</p>}

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
        </form>
      </main>
    </>
  );
}