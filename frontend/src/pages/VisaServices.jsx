import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

export default function VisaServices() {
  useSEO({
    title: "Visa Application Support",
    description: "Document preparation help for family, student, tourist, and fiancé(e) visas. Immigration Pathways Consulting guides you every step of the way.",
  });
  return (
    <section>
      <header className="site-header">
        <h1>Visa Application Support</h1>
        <p>Helping you gather and prepare the right documents for your visa journey</p>
      </header>

      <main className="about-page visa-section">
        <section className="about-content">
          <h2>What Types of Visas Do We Support?</h2>
          <p>
            At <strong>Immigration Pathways Consulting LLC</strong>, we assist with
            preparing and organizing applications for a variety of nonimmigrant and
            immigrant visa categories. Our services are designed to support families,
            students, and couples pursuing lawful entry to the U.S. through official
            channels.
          </p>

          <h3>Common Visa Categories</h3>
          <ul>
            <li>
              <strong>
                <Link to="/services/visa-services/family-visas">Family-Based Visas:</Link>
              </strong>{" "}
              For spouses, children, parents, and siblings of U.S. citizens or lawful
              permanent residents
            </li>
            <li>
              <strong>
                <Link to="/services/visa-services/fiance-visas">Fiancé(e) Visas (K-1):</Link>
              </strong>{" "}
              For foreign nationals engaged to U.S. citizens
            </li>
            <li>
              <strong>
                <Link to="/services/visa-services/student-visas">Student Visas (F-1/M-1):</Link>
              </strong>{" "}
              For academic or vocational study in the U.S.
            </li>
            <li>
              <strong>
                <Link to="/services/visa-services/tourist-visas">Tourist/Visitor Visas (B-1/B-2):</Link>
              </strong>{" "}
              For temporary visits related to travel, tourism, or business
            </li>
          </ul>

          <h2>How We Help</h2>
          <p>
            Our goal is to help clients understand the general requirements and
            compile the right documents for submission. While we do not provide legal
            advice, our visa support includes:
          </p>
          <ul>
            <li>Organizing required documents for the appropriate visa type</li>
            <li>Filling out and reviewing common USCIS or Department of State forms</li>
            <li>Providing general guidance on timelines and next steps</li>
            <li>Helping couples prepare supporting materials for fiancé(e) visas</li>
            <li>Assisting students with document prep for consular appointments</li>
          </ul>

          <div className="note">
            <p>
              <strong>Please Note:</strong> The above list highlights some of the most
              common visa categories we assist with. If you are pursuing a different
              type of visa, we are happy to help. Contact us to discuss your specific
              situation.
            </p>
          </div>

          <Link to="/contact" className="button">
            Schedule a Free Consultation
          </Link>
        </section>
      </main>
    </section>
  );
}