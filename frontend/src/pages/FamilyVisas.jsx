import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO.js";

export default function FamilyVisas() {
  useSEO({
    title: "Family-Based Visa Petition Support",
    description: "Help preparing family-based visa petitions to bring loved ones to the United States lawfully.",
  });
  return (
    <>
      <header className="site-header">
        <h1>Family-Based Visa Petition Support</h1>
        <p>Helping your loved ones take the next step toward lawful U.S. residence</p>
      </header>

      <main className="about-page family-section">
        <section className="about-content">
          <h2>What Are Family-Based Visas?</h2>
          <p>
            Family-based immigration allows U.S. citizens and lawful permanent residents (green card holders) to petition
            for certain relatives to join them in the United States. The process begins with filing Form I-130 to establish
            the qualifying relationship.
          </p>

          <h3>1. Immediate Relatives of U.S. Citizens</h3>
          <p>These visas have no annual limit (how many the government allows) and typically process faster:</p>
          <ul>
            <li>Spouse (IR-1)</li>
            <li>Unmarried child under 21 (IR-2)</li>
            <li>Orphans adopted abroad or to be adopted in the U.S. (IR-3 / IR-4)</li>
            <li>Parent of a U.S. citizen (if the citizen is 21 or older) (IR-5)</li>
          </ul>

          <h3>2. Family Preference Categories</h3>
          <p>These visas are subject to annual limits (how many the government allows) and longer wait times:</p>
          <ul>
            <li>F1: Unmarried sons and daughters (21+) of U.S. citizens</li>
            <li>F2A: Spouses and unmarried children (under 21) of green card holders</li>
            <li>F2B: Unmarried sons and daughters (21+) of green card holders</li>
            <li>F3: Married sons and daughters of U.S. citizens</li>
            <li>F4: Siblings of U.S. citizens (sponsor must be 21+)</li>
          </ul>

          <h2>How We Help</h2>
          <p>
            At <strong>Immigration Pathways Consulting LLC</strong>, we provide personalized document support for family
            petitioners. Our services include:
          </p>
          <ul>
            <li>Assistance preparing Form I-130 and supporting documentation</li>
            <li>Organizing evidence to prove qualifying relationships</li>
            <li>Guidance on timelines and communication with NVC</li>
            <li>Consular processing preparation when needed</li>
          </ul>

          <Link to="/contact" className="button">
            Schedule a Free Consultation
          </Link>
        </section>
      </main>
    </>
  );
}