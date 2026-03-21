import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

export default function Citizenship() {
  useSEO({
    title: "Naturalization & Citizenship Support",
    description: "Get help preparing your N-400 naturalization application and citizenship documents with Immigration Pathways Consulting.",
  });
  return (
    <section>
      <header className="site-header">
        <h1>Naturalization &amp; Citizenship Support</h1>
        <p>Helping you prepare for the final step toward becoming a U.S. citizen</p>
      </header>

      <main className="about-page citizenship-section">
        <section className="about-content">
          <h2>What is Naturalization?</h2>
          <p>
            Naturalization is the process by which a lawful permanent resident (green
            card holder) becomes a U.S. citizen. Eligible applicants must meet certain
            residency, language, and civics requirements, and complete Form N-400 to
            begin the process.
          </p>

          <h2>Common Requirements</h2>
          <ul>
            <li>Be at least 18 years old</li>
            <li>
              Be a lawful permanent resident for 3 or 5 years (depending on your
              situation)
            </li>
            <li>Have continuous residence and physical presence in the U.S.</li>
            <li>Demonstrate good moral character</li>
            <li>Be able to speak, read, and write basic English</li>
            <li>Pass a U.S. civics and history test</li>
            <li>Take the Oath of Allegiance</li>
          </ul>

          <h2>How We Can Help</h2>
          <p>
            At <strong>Immigration Pathways Consulting LLC</strong>, we support
            individuals and families as they prepare for the naturalization process.
            While we do not offer legal advice, we can help you:
          </p>
          <ul>
            <li>Understand general eligibility requirements</li>
            <li>Prepare and organize the Form N-400 and supporting documents</li>
            <li>Collect evidence of continuous residence and good moral character</li>
            <li>Practice for the English and civics tests</li>
            <li>Get ready for your naturalization interview</li>
          </ul>

          <Link to="/contact" className="button">
            Schedule a Free Consultation
          </Link>

          <div className="quiz-highlight" style={{ marginTop: "2rem" }}>
            <h2>Practice for the Civics Test</h2>
            <p>Use our free U.S. Citizenship Practice Quiz to prepare for the naturalization interview.</p>
            <Link to="/quiz" className="quiz-btn">Take the Practice Quiz</Link>
          </div>
        </section>
      </main>
    </section>
  );
}