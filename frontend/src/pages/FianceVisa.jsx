import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

export default function FianceVisa() {
  useSEO({
    title: "K-1 Fiancé(e) Visa Support",
    description: "Document preparation support for K-1 fiancé(e) visa applications, helping couples navigate the path to U.S. residency together.",
  });
  return (
    <>
      <header className="site-header">
        <h1>K-1 Fiancé(e) Visa Support</h1>
        <p>Helping couples prepare for their journey toward U.S. residency</p>
      </header>

      <main className="about-page fiancee-section">
        <section className="about-content">
          <h2>What is the K-1 Fiancé(e) Visa?</h2>
          <p>
            The K-1 visa is for foreign nationals engaged to U.S. citizens. It allows the
            foreign fiancé(e) to enter the United States for the purpose of marrying
            within 90 days. After marriage, the individual may apply to adjust status
            to obtain lawful permanent residence.
          </p>

          <h2>Basic Requirements</h2>
          <ul>
            <li>The petitioner must be a U.S. citizen</li>
            <li>Both parties must be legally free to marry</li>
            <li>The couple must have met in person within the past 2 years (with limited exceptions)</li>
            <li>The intention to marry within 90 days of arrival must be genuine</li>
          </ul>

          <h2>Steps in the Process</h2>
          <ol>
            <li>U.S. citizen files Form I-129F petition</li>
            <li>USCIS approves and sends the case to the National Visa Center (NVC)</li>
            <li>NVC forwards the case to the U.S. embassy/consulate abroad</li>
            <li>Fiancé(e) attends interview and receives K-1 visa</li>
            <li>Couple marries in the U.S. within 90 days of arrival</li>
            <li>Applicant files for adjustment of status (green card)</li>
          </ol>

          <h2>How We Help</h2>
          <p>
            At <strong>Immigration Pathways Consulting LLC</strong>, we provide non-legal
            document preparation support to help couples:
          </p>
          <ul>
            <li>Prepare and review Form I-129F and supporting documents</li>
            <li>Organize relationship evidence and intent-to-marry statements</li>
            <li>Stay on track with timelines and document checklists</li>
            <li>Prepare for the consular interview process</li>
          </ul>

          <Link to="/contact" className="button">
            Schedule a Free Consultation
          </Link>
        </section>
      </main>
    </>
  );
}