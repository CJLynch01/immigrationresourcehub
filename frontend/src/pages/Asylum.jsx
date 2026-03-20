import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

export default function Asylum() {
  useSEO({
    title: "Asylum & Humanitarian Relief",
    description: "Document preparation support for individuals seeking asylum or humanitarian relief in the United States.",
  });
  return (
    <>
      <header className="site-header">
        <h1>Asylum & Humanitarian Relief</h1>
        <p>Guidance for individuals seeking protection in the U.S.</p>
      </header>

      <main className="about-page asylum-section">
        <section className="about-content">
          <h2>What is Asylum?</h2>
          <p>
            Asylum is a form of protection for individuals who are already in
            the United States and are unable or unwilling to return to their
            home country due to past persecution or a well-founded fear of
            future persecution based on race, religion, nationality, political
            opinion, or membership in a particular social group.
          </p>

          <h2>Who Can Apply?</h2>
          <p>Individuals may be eligible for asylum if they:</p>
          <ul>
            <li>Are physically present in the U.S., regardless of their method of entry</li>
            <li>Apply for asylum within one year of their last entry (with some exceptions)</li>
            <li>Can demonstrate fear of persecution for protected reasons</li>
          </ul>

          <h2>Other Humanitarian Relief Options</h2>
          <p>
            In addition to asylum, we can help with applications for related
            forms of humanitarian relief, such as:
          </p>
          <ul>
            <li>Withholding of Removal</li>
            <li>Protection under the Convention Against Torture (CAT)</li>
            <li>Temporary Protected Status (TPS)</li>
            <li>Humanitarian parole and deferred action requests</li>
          </ul>

          <h2>How We Can Help</h2>
          <p>
            At <strong>Immigration Pathways Consulting LLC</strong>, we offer
            compassionate and confidential support with your asylum and
            humanitarian applications. While we do not offer legal advice,
            we assist with:
          </p>
          <ul>
            <li>Document preparation for Form I-589 and other filings</li>
            <li>Organizing supporting evidence and personal statements</li>
            <li>Providing general guidance on timelines and process expectations</li>
            <li>Helping you understand your rights and options based on public information</li>
          </ul>

          <p>
            <em>
              Please note: Applying for asylum does not guarantee approval or
              protection, and eligibility is determined by USCIS or the
              immigration courts. We are not attorneys and do not provide
              legal representation.
            </em>
          </p>

          <Link to="/contact" className="button">
            Schedule a Free Consultation
          </Link>
        </section>
      </main>
    </>
  );
}