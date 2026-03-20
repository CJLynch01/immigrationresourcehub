import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

export default function StudentVisas() {
  useSEO({
    title: "Student Visa Support",
    description: "Help preparing F-1 and M-1 student visa applications and supporting documents for international students.",
  });
  return (
    <>
      <header className="site-header">
        <h1>Student Visa Support</h1>
        <p>Helping students navigate the F-1 and M-1 visa process</p>
      </header>

      <main className="about-page student-section">
        <section className="about-content">
          <h2>Overview of Student Visas</h2>
          <p>The U.S. offers two primary student visa types:</p>
          <ul>
            <li>
              <strong>F-1 Visa:</strong> For full-time academic students attending a college,
              university, high school, language training program, or other academic institutions.
            </li>
            <li>
              <strong>M-1 Visa:</strong> For students enrolled in vocational or non-academic programs,
              such as technical schools.
            </li>
          </ul>

          <h2>Eligibility Requirements</h2>
          <ul>
            <li>You must be accepted by a SEVP-approved school in the U.S.</li>
            <li>You must enroll as a full-time student</li>
            <li>You must demonstrate financial support during your studies</li>
            <li>You must show intent to return to your home country after completing your program</li>
          </ul>

          <h2>Application Process</h2>
          <ol>
            <li>Apply and get accepted by a SEVP-certified institution</li>
            <li>Receive Form I-20 from the school</li>
            <li>Pay the SEVIS I-901 fee</li>
            <li>Complete the DS-160 visa application form</li>
            <li>Schedule and attend a visa interview at a U.S. embassy/consulate</li>
          </ol>

          <h2>How We Help</h2>
          <p>
            At <strong>Immigration Pathways Consulting LLC</strong>, we offer non-legal guidance to help
            international students:
          </p>
          <ul>
            <li>Review Form I-20 and SEVIS fee instructions</li>
            <li>Assist with completing the DS-160 application</li>
            <li>Organize required financial and academic documents</li>
            <li>Prepare for the consular interview with helpful checklists</li>
          </ul>

          <Link to="/contact" className="button">
            Schedule a Free Consultation
          </Link>
        </section>
      </main>
    </>
  );
}