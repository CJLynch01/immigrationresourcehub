import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

export default function About() {
  useSEO({
    title: "About Us",
    description: "Learn about Immigration Pathways Consulting — dedicated to helping immigrants navigate U.S. immigration processes with expert document preparation support.",
  });
  return (
    <section>
      <header className="site-header">
        <h1>About Immigration Pathways</h1>
        <p>Empowering your journey to a better future</p>
      </header>

      <main className="about-page">
        <section className="about-content">
          <h2>Our Mission</h2>
          <p>
            At Immigration Pathways Consulting, our mission is to simplify the
            complex U.S. immigration process and provide compassionate,
            personalized support to individuals and families seeking legal
            immigration solutions.
          </p>

          <h2>Who We Are</h2>
          <div className="about-profile">
            <img
              src="/images/chris-profile.webp"
              alt="Chris Lynch"
              className="about-photo"
            />
            <div>
              <p>
                My name is <strong>Chris Lynch</strong>. I’m a retired federal
                law enforcement officer and a software development student at
                BYU–Idaho. I founded Immigration Pathways to use my knowledge,
                technical skills, and life experience to help others navigate
                the immigration process with confidence.
              </p>
              <p>
                I’m passionate about empowering families, staying informed on
                immigration policy, and building tools that make a real
                difference in people’s lives.
              </p>
            </div>
          </div>

          <h2>Why Choose Us?</h2>
          <ul>
            <li>✅ Personalized document preparation and support</li>
            <li>✅ Compassionate guidance — we’ve walked the journey too</li>
            <li>✅ Experience — Over 15 years experience with immigration</li>
            <li>✅ Tools to help you stay informed and organized</li>
            <li>✅ Licensed Immigration Document Preparer – State of Utah</li>
            <li>✅ Bonded and insured for your protection</li>
          </ul>

          <p className="verify-udoc">
            <strong>License #:</strong> 14199653-IC00
            <br />
            🔗{" "}
            <a
              href="https://db.dcp.utah.gov/registered.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Verify License with Utah Department of Commerce
            </a>
          </p>

          <p>
            <strong>Westfield Insurance Company Bond #:</strong> 445443N
            <br />
            One Park Circle, Westfield Center, OH 44251
            <br />
            (800) 243-0210
          </p>

          <p>
            We're here to help you move forward. Let’s take the next step together.
          </p>
        </section>

        <div className="cta-banner">
          <h3>Have questions? We're here to help.</h3>
          <Link to="/contact" className="button">
            Contact Us
          </Link>
        </div>
      </main>
    </section>
  );
}