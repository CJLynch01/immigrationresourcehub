import React from "react";
import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

export default function WorkPermit() {
  useSEO({
    title: "Work Permit & Employment Authorization",
    description: "Get help preparing your Employment Authorization Document (EAD) application with Immigration Pathways Consulting.",
  });
  return (
    <>
      <header className="site-header">
        <h1>Work Permit & Employment Authorization</h1>
        <p>Helping you apply for permission to work lawfully in the United States</p>
      </header>

      <main className="about-page work-permit">
        <section className="about-content">
          <h2>What is a Work Permit?</h2>
          <p>
            A work permit, officially known as an Employment Authorization Document (EAD),
            allows certain noncitizens in the U.S. to work legally for a specified period of time.
            It is issued by U.S. Citizenship and Immigration Services (USCIS) and is often
            available to those with pending immigration applications or humanitarian status.
          </p>

          <h2>Who May Be Eligible?</h2>
          <p>
            Eligibility for a work permit depends on your current immigration status
            or pending application. Common categories include:
          </p>
          <ul>
            <li>Individuals with pending asylum applications</li>
            <li>Adjustment of status applicants (green card applicants)</li>
            <li>DACA recipients (Deferred Action for Childhood Arrivals)</li>
            <li>TPS recipients (Temporary Protected Status)</li>
            <li>Spouses of certain visa holders (e.g., L-2, E-2, H-4 with approved I-140)</li>
            <li>U nonimmigrants and VAWA self-petitioners</li>
          </ul>

          <h2>How We Can Help</h2>
          <p>
            At <strong>Immigration Pathways Consulting LLC</strong>, we provide
            document preparation services to help eligible individuals apply
            for a work permit. Our services include:
          </p>
          <ul>
            <li>Filling out Form I-765 accurately</li>
            <li>Preparing required supporting documentation</li>
            <li>Providing a checklist for evidence submission</li>
            <li>Explaining general timelines and what to expect</li>
          </ul>

          <Link to="/contact" className="button">
            Schedule a Free Consultation
          </Link>
        </section>
      </main>
    </>
  );
}