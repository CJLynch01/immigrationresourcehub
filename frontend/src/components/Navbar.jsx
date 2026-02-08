import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Close menu when navigating (nice on mobile)
  const closeMenu = () => setOpen(false);

  return (
    <>
      <header className="site-header">
        <div className="header-content">
          {/* If you have a logo file, put it in /public and set src="/logo.png" */}
          {/* <img className="site-logo" src="/logo.png" alt="Immigration Pathways logo" /> */}

          <div>
            <h1 style={{ margin: 0 }}>Immigration Pathways</h1>
            <p style={{ margin: "0.25rem 0 0", opacity: 0.9 }}>
              Resource Hub
            </p>
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

        <NavLink to="/login" onClick={closeMenu}>
          Login
        </NavLink>

        {/* Optional admin dropdown (keep/remove as needed) */}
        <div className="admin-dropdown">
          <button className="dropbtn" type="button">
            Admin ▾
          </button>
          <div className="dropdown-content">
            <NavLink to="/admin" onClick={closeMenu}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/posts" onClick={closeMenu}>
              Posts
            </NavLink>
            <NavLink to="/admin/documents" onClick={closeMenu}>
              Documents
            </NavLink>
          </div>
        </div>
      </nav>
    </>
  );
}

