import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

export default function NotFound() {
  useSEO({ title: "Page Not Found" });

  return (
    <>
      <header className="site-header">
        <h1>404</h1>
        <p>Page not found</p>
      </header>

      <main style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <p style={{ fontSize: "1.1rem", marginBottom: "2rem", color: "#aaa" }}>
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" className="button">Go Home</Link>
          <Link to="/contact" className="button">Contact Us</Link>
        </div>
      </main>
    </>
  );
}
