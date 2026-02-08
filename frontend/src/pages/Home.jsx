import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="landing-content">
      {/* HERO SECTION */}
      <section className="hero">
        <h2>Let Us Handle the Paperwork</h2>
        <p>
          At Immigration Pathways Consulting, we simplify the immigration process with personalized support,
          professional tools, and compassionate service.
        </p>
        <Link to="/services" className="button">
          Explore Our Services
        </Link>
      </section>

      {/* QUIZ HIGHLIGHT */}
      <section className="quiz-highlight">
        <h2>U.S. Citizenship Practice Quiz</h2>
        <p>Prepare for the naturalization test with our full 100-question practice quiz.</p>
        <p>
          <strong>You must be logged in to access the quiz and save your progress.</strong>
        </p>
        <Link className="quiz-btn" to="/login">
          Log In to Begin
        </Link>
      </section>

      {/* IMAGE */}
      <div className="photo-wrapper1">
        <img src="/images/immigrant-world.webp" alt="Traveling with passport VISA" />
      </div>

      {/* WHY CHOOSE US */}
      <section className="why-choose-us">
        <h2>Why Immigration Pathways?</h2>
        <p>
          With years of experience inside the U.S. immigration system, we provide a level of insight and
          compassion unmatched by document preparers alone. We're your partners throughout the process.
        </p>
        <ul>
          <li>✔ Personalized attention for every case</li>
          <li>✔ Transparent, flat-rate pricing</li>
          <li>✔ Continual communication throughout the process</li>
        </ul>
      </section>

      {/* IMAGE */}
      <div className="photo-wrapper2">
        <img src="/images/passport-photo.webp" alt="Traveling with passport VISA" />
      </div>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <ol>
          <li><strong>Step 1:</strong> Schedule a free consultation.</li>
          <li><strong>Step 2:</strong> We assess your needs and immigration goals.</li>
          <li><strong>Step 3:</strong> We prepare and help organize your documents.</li>
          <li><strong>Step 4:</strong> We file the documents for you.</li>
          <li><strong>Step 5:</strong> We provide you with updates on your document status.</li>
        </ol>
      </section>

      {/* IMAGE */}
      <div className="photo-wrapper3">
        <img src="/images/chris-helping.webp" alt="Chris helping a client with immigration paperwork" />
      </div>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <h2>What Our Clients Say</h2>

        <blockquote>
          “Chris made everything feel easier. I didn’t know where to start, and now I have my work permit in hand.”
          <br />
          <cite>– Angela R., Ogden, UT</cite>
        </blockquote>

        <blockquote>
          “Professional, trustworthy, and patient. I’m so grateful for their help with my green card renewal.”
          <br />
          <cite>– Mohammed K., Salt Lake City, UT</cite>
        </blockquote>
      </section>
    </main>
  );
}