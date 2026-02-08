import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-section">
        <p><strong>Immigration Pathways Consulting LLC</strong></p>
        <p>Ogden, Utah</p>
        <p>
          Email:{" "}
          <a href="mailto:chris@immigrationpathwaysconsulting.com">
            chris@immigrationpathwaysconsulting.com
          </a>
          <br />
          Phone:{" "}
          <a href="tel:3852793148">
            (385) 279-3148
          </a>
        </p>
      </div>

      <div className="footer-section">
        <nav className="footer-nav">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/blog">Blog</Link>
        </nav>
      </div>

      <div className="footer-section">
        <div className="social-icons">
          <a
            href="https://www.facebook.com/profile.php?id=61574005612583"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-facebook fa-lg"></i> Page
          </a>

          <a
            href="https://www.facebook.com/groups/994955182058038"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-users fa-lg"></i> Group
          </a>
        </div>
      </div>

      <div className="footer-section small-print">
        <p>
          <Link to="/legal">Privacy Policy</Link> |{" "}
          <Link to="/legal">Terms of Use</Link>
        </p>
        <p>© {new Date().getFullYear()} Immigration Pathways Consulting LLC</p>
      </div>
    </footer>
  );
}
