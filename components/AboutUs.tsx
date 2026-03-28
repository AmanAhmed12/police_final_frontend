"use client";

import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <section id="aboutus" className="container">
      <div className="section-title">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ color: "var(--primary)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: "16px", display: "block" }}
        >
          OUR STORY
        </motion.span>
        <h2>About CityGuard</h2>
        <p className="section-sub">
          We are dedicated to providing seamless online police assistance,
          ensuring safety and support for our community through digital innovation.
        </p>
      </div>

      <div className="grid-standard">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card"
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "32px" }}>🛡️</div>
          <h3 style={{ marginBottom: "16px", fontSize: "1.5rem" }}>Our Mission</h3>
          <p style={{ color: "var(--fg-secondary)", fontSize: "1.1rem", lineHeight: "1.7" }}>
            To make police services accessible, transparent, and efficient for everyone
            through digital transformation and community engagement.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card"
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "32px" }}>🎯</div>
          <h3 style={{ marginBottom: "16px", fontSize: "1.5rem" }}>Our Vision</h3>
          <p style={{ color: "var(--fg-secondary)", fontSize: "1.1rem", lineHeight: "1.7" }}>
            To be the world-class digital bridge between law enforcement and citizens,
            fostering a safer and more connected society.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
