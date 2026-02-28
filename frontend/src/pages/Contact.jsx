import { useState } from "react";

export default function Contact() {
  // Optional: light client-side UX only (Formspree still handles submission)
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <section>
      <header className="site-header">
        <h1>Contact Us</h1>
        <p>We’re here to help you every step of the way</p>
      </header>

      <main className="contact-page">
        <section className="contact-form">
          <h2>Send Us a Message</h2>

          <form
            action="https://formspree.io/f/mvgrarol"
            method="POST"
            onSubmit={() => setIsSubmitting(true)}
          >
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" required />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="_replyto" required />

            <label htmlFor="message">Message:</label>
            <textarea id="message" name="message" rows={5} required />

            {/* 🐝 Honeypot field for bots */}
            <input
              type="text"
              name="_gotcha"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </section>

        <section className="contact-info">
          <p>
            If you have questions or would like to schedule a consultation
            directly, feel free to reach out:
          </p>

          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:chris@immigrationpathwaysconsulting.com">
              chris@immigrationpathwaysconsulting.com
            </a>
          </p>

          <p>
            <strong>Phone:</strong> (385) 279-3148
          </p>

          <p>
            <strong>Address:</strong> 3293 Harrison Blvd. Ste#200, Ogden, Utah
            84403
          </p>

          <p>We typically respond within 24 hours. Please schedule an appointment.</p>
        </section>

        <section className="location-map">
          <h2>Our Location</h2>
          <iframe
            title="Immigration Pathways Consulting LLC Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3001.8323490742523!2d-111.95174455849146!3d41.20362850749112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8753092c514c0623%3A0x6a5ae62de9f9dd00!2sImmigration%20Pathways%20Consulting%20LLC!5e0!3m2!1sen!2sus!4v1749704169149!5m2!1sen!2sus"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>

        <div className="cta-banner">
          <h3>Let’s start your immigration journey together</h3>
          <a
            href="mailto:chris@immigrationpathwaysconsulting.com"
            className="button"
          >
            Email Chris
          </a>
        </div>
      </main>
    </section>
  );
}