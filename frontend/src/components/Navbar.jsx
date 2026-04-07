import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();

  const closeMenu = () => { setOpen(false); setAdminOpen(false); };

  const isLoggedIn = !!localStorage.getItem("token");
  const isAdmin = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.role === "admin"; }
    catch { return false; }
  })();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!isAdmin) return;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    async function fetchCounts() {
      try {
        const [msgs, contacts, clients] = await Promise.all([
          fetch(`${API_BASE}/api/messages/unread-count`, { headers }).then(r => r.ok ? r.json() : {}),
          fetch(`${API_BASE}/api/contact/unread-count`, { headers }).then(r => r.ok ? r.json() : {}),
          fetch(`${API_BASE}/api/users/new-count`, { headers }).then(r => r.ok ? r.json() : {}),
        ]);
        setNotifCount((msgs.unreadCount || 0) + (contacts.unreadCount || 0) + (clients.newCount || 0));
      } catch { /* ignore */ }
    }

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    closeMenu();
    navigate("/login");
  }

  return (
    <>
      <header className="site-header">
        <div className="header-content">
          <div className="header-brand-group">
            <img src="/images/logo.webp" alt="Immigration Pathways Consulting" className="site-logo" />
            <div className="header-brand">
              <span className="header-brand__name">Immigration Pathways Consulting</span>
              <span className="header-brand__tagline">Your trusted guide through the U.S. immigration process</span>
            </div>
          </div>

          <button
            className="hamburger"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </header>

      <nav className={`navbar ${open ? "active" : ""}`} aria-label="Primary">
        <NavLink to="/" end onClick={closeMenu}>
          Home
        </NavLink>

        <NavLink to="/about" onClick={closeMenu}>
          About
        </NavLink>

        <NavLink to="/services" onClick={closeMenu}>
          Services
        </NavLink>

        <NavLink to="/contact" onClick={closeMenu}>
          Contact
        </NavLink>

        <NavLink to="/blog" onClick={closeMenu}>
          Blog
        </NavLink>

        {!isLoggedIn && (
          <NavLink to="/login" onClick={closeMenu}>
            Login
          </NavLink>
        )}

        {isLoggedIn && !isAdmin && (
          <NavLink to="/client" onClick={closeMenu}>
            Dashboard
          </NavLink>
        )}

        {isLoggedIn && (
          <button type="button" onClick={handleLogout} className="nav-logout-btn">
            Logout
          </button>
        )}

        {isAdmin && (
          <div className={`admin-dropdown ${adminOpen ? "open" : ""}`}>
            <button
              className="dropbtn"
              type="button"
              onClick={() => setAdminOpen((v) => !v)}
            >
              Admin ▾
              {notifCount > 0 && (
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "crimson", color: "#fff", borderRadius: "50%",
                  fontSize: "0.7rem", fontWeight: 700, minWidth: "18px", height: "18px",
                  padding: "0 4px", marginLeft: "6px", lineHeight: 1,
                }}>
                  {notifCount}
                </span>
              )}
            </button>
            <div className="dropdown-content">
              <NavLink to="/admin" onClick={closeMenu}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/posts" onClick={closeMenu}>
                Blog
              </NavLink>
              <NavLink to="/admin/messages" onClick={closeMenu}>
                Messages
              </NavLink>
              <NavLink to="/admin/contacts" onClick={closeMenu}>
                Contacts
              </NavLink>
              <NavLink to="/admin/clients" onClick={closeMenu}>
                Clients
              </NavLink>
              <NavLink to="/admin/analytics" onClick={closeMenu}>
                Analytics
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}