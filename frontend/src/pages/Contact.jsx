import { useState } from "react";
import useSEO from "../hooks/useSEO.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Contact() {
  useSEO({
    title: "Contact Us",
    description: "Get in touch with Immigration Pathways Consulting. We're here to answer your questions and help you start your immigration document preparation journey.",
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // "success" | "error"
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMsg(data.error || "Failed to send. Please try again.");
        return;
      }
      setStatus("success");
      setMsg(data.msg || "Message sent!");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <header className="site-header">
        <h1>Contact Us</h1>
        <p>We're here to help you every step of the way</p>
      </header>

      <main className="contact-page">
        <section className="contact-form">
          <h2>Send Us a Message</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {status && (
              <p className={`form-message form-message--${status}`}>{msg}</p>
            )}

            <button type="submit" className="button" disabled={loading || status === "success"}>
              {loading ? "Sending..." : "Send Message"}
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
            <strong>Address:</strong> 3293 Harrison Blvd. Ste#200, Ogden, Utah 84403
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
          <h3>Let's start your immigration journey together</h3>
          <a href="mailto:chris@immigrationpathwaysconsulting.com" className="button">
            Email Chris
          </a>
        </div>
      </main>
    </section>
  );
}
