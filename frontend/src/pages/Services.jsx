import { Link } from "react-router-dom";

export default function Services() {
  return (
    <section>
      <header className="site-header">
        <h1>Our Services</h1>
        <p>Professional guidance every step of the way</p>
      </header>

      <main className="services-page">
        <section className="service-list">
          <div className="service">
            <h2>
              <Link to="/services/citizenship">Naturalization &amp; Citizenship</Link>
            </h2>
            <p>
              We assist eligible permanent residents with applying for U.S.
              citizenship, preparing documentation, and understanding the
              naturalization interview process.
            </p>
          </div>

          <div className="service">
            <h2>
              <Link to="/services/visa-services">Visa Services</Link>
            </h2>
            <p>
              We assist clients in preparing and submitting visa applications for
              various categories, including family-based visas, fiancé(e) visas,
              student visas, and more. Let us help ensure your documentation is
              complete and correctly filed to avoid delays.
            </p>
          </div>

          <div className="service">
            <h2>
              <Link to="/services/consular-processing">Consular Processing Support</Link>
            </h2>
            <p>
              We provide affordable support for individuals required to complete
              the green card process abroad due to unlawful entry or ineligibility
              for adjustment of status in the U.S. Learn how we can assist with
              I-130 petitions, I-601A waivers, and consular interview preparation.
            </p>
          </div>

          <div className="service">
            <h2>
              <Link to="/services/family-petition">Family-Based Petitions</Link>
            </h2>
            <p>
              We help U.S. citizens and legal permanent residents petition for
              eligible relatives to join them in the U.S. legally.
            </p>
          </div>

          <div className="service">
            <h2>
              <Link to="/services/work-permit">Work Permit &amp; Employment Authorization</Link>
            </h2>
            <p>
              Need authorization to work in the U.S.? We guide you through the
              process and help prepare all required documents.
            </p>
          </div>

          <div className="service">
            <h2>
              <Link to="/services/adjustment-of-status">Adjustment of Status (Green Card)</Link>
            </h2>
            <p>
              For those already in the U.S., we provide support for obtaining
              lawful permanent residence without leaving the country.
            </p>
          </div>

          <div className="service">
            <h2>
              <Link to="/services/asylum">Asylum &amp; Humanitarian Relief</Link>
            </h2>
            <p>
              We provide compassionate support for individuals seeking asylum or
              other forms of humanitarian protection in the U.S.
            </p>
          </div>

          <div className="service">
            <h2>Pricing</h2>
            <p>
              At <strong>Immigration Pathways Consulting</strong>, we believe in
              fair, transparent pricing tailored to your specific needs. Because
              every immigration case is unique, we do not offer flat fees.
              Instead, we provide a personalized quote following a free
              consultation.
            </p>
            <p>
              All costs are clearly outlined in a written service agreement, and
              we never charge hidden fees. Your peace of mind matters to us.
            </p>
            <p>
              <em>
                Note: Our service fees do not include USCIS filing fees or other
                government charges.
              </em>
            </p>
          </div>
        </section>

        <div className="cta-banner">
          <h3>Ready to get started?</h3>
          <Link to="/contact" className="button">
            Schedule a Free Consultation
          </Link>
        </div>
      </main>
    </section>
  );
}