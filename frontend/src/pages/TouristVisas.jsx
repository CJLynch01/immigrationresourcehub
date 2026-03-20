import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

export default function TouristVisas() {
  useSEO({
    title: "Visitor Visa Support",
    description: "Help preparing B-1/B-2 visitor and tourist visa applications with properly organized supporting documents.",
  });
  return (
    <>
      <header className="site-header">
        <h1>Visitor Visa Support</h1>
        <p>Helping travelers prepare strong B-1/B-2 visa applications</p>
      </header>

      <main className="about-page visitor-section">
        <section className="about-content">
          <h2>What are B-1 and B-2 Visas?</h2>
          <p>
            B-1 and B-2 visas are nonimmigrant visas for individuals temporarily
            visiting the U.S. for business, tourism, or medical treatment.
            These visas are commonly issued together as a combined B-1/B-2 visitor visa.
          </p>

          <ul>
            <li>
              <strong>B-1 Visa:</strong> For short-term business activities such as attending meetings or conferences
            </li>
            <li>
              <strong>B-2 Visa:</strong> For tourism, family visits, or medical purposes
            </li>
          </ul>

          <h2>Eligibility Criteria</h2>
          <ul>
            <li>You must demonstrate intent to return to your home country</li>
            <li>You must show that your visit is temporary in nature</li>
            <li>You must prove you have sufficient funds to cover your stay</li>
            <li>You must not plan to work or study in the U.S.</li>
          </ul>

          <h2>Application Process</h2>
          <ol>
            <li>Complete the DS-160 visa application form online</li>
            <li>Pay the visa application fee</li>
            <li>Schedule and attend a visa interview at a U.S. embassy or consulate</li>
            <li>
              Present evidence of your travel plans, financial support,
              and ties to your home country
            </li>
          </ol>

          <h2>How We Help</h2>
          <p>
            At <strong>Immigration Pathways Consulting LLC</strong>, we help
            travelers and families prepare well-organized visitor visa applications by:
          </p>
          <ul>
            <li>Helping complete and review the DS-160 form</li>
            <li>Organizing required supporting documents</li>
            <li>Offering preparation tips for visa interviews</li>
            <li>Providing document checklists tailored to each visitor's purpose</li>
          </ul>

          <Link to="/contact" className="button">
            Schedule a Free Consultation
          </Link>
        </section>
      </main>
    </>
  );
}