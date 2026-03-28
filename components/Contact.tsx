"use client";

import { motion } from "framer-motion";

const contactInfo = [
  { icon: "📧", label: "Email", value: "support@cityguard.lk", href: "mailto:support@cityguard.lk", action: "Send Email" },
  { icon: "📞", label: "Phone", value: "+94 11 123 4567", href: "tel:+94111234567", action: "Call Now" },
  { icon: "🌐", label: "Website", value: "Sri Lanka Police", href: "https://www.police.lk/", action: "Visit Site" },
];

export default function ContactUs() {
  return (
    <section id="contact" className="container">
      <div className="section-title">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ color: "var(--primary)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: "16px", display: "block" }}
        >
          GET IN TOUCH
        </motion.span>
        <h2>Contact Us</h2>
        <p className="section-sub">
          Have questions or need assistance? Our team is available 24/7.
        </p>
      </div>

      <div className="grid-standard">
        {contactInfo.map((info, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            className="glass-card"
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "28px" }}>{info.icon}</div>
            <h3 style={{ marginBottom: "8px", fontSize: "1.4rem" }}>{info.label}</h3>
            <p style={{ color: "var(--fg-secondary)", marginBottom: "32px", fontSize: "1rem" }}>{info.value}</p>
            <a
              href={info.href}
              target={info.label === "Website" ? "_blank" : undefined}
              rel={info.label === "Website" ? "noopener noreferrer" : undefined}
            >
              <button className="btn-secondary" style={{ width: "100%" }}>
                {info.action}
              </button>
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
