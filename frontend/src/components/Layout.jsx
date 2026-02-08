import { Outlet, Link } from "react-router-dom";
import Footer from "./Footer.jsx";

export default function Layout() {
  return (
    <div className="app-layout">
      <header className="site-header">
        <nav className="nav">
          <Link to="/" className="logo">
            Immigration Pathways Consulting
          </Link>

          <ul className="nav-links">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}


