"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CallToAction() {
  return (
    <section className="cta">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="glass-card"
          style={{
            textAlign: "center",
            padding: "80px 40px",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(11, 14, 20, 0.4) 100%)",
          }}
        >
          <h2 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", marginBottom: "24px" }}>Ready to Stay Protected?</h2>
          <p style={{ fontSize: "1.3rem", color: "var(--fg-secondary)", marginBottom: "48px", maxWidth: "600px", margin: "0 auto 48px" }}>
            Join CityGuard today and experience a safer, more connected community.
          </p>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
            <Link href="/Register" passHref>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
              >
                Get Started Now
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
