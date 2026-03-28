"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, ArrowRight, Radio } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="bento-grid">
          {/* Main Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="bento-item bento-col-8 bento-row-2"
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--primary)", fontWeight: 800, fontSize: "0.8rem", letterSpacing: "0.15em", marginBottom: "32px", textTransform: "uppercase" }}>
                <Shield size={16} /> Secure Portal Sri Lanka
              </div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: "1.1", marginBottom: "20px" }}>
                Modernizing Safety. <br />
                <span style={{ color: "var(--primary)" }}>Empowering Citizens.</span>
              </h1>
              <p style={{ color: "var(--fg-secondary)", fontSize: "1.05rem", maxWidth: "480px", marginBottom: "32px" }}>
                CityGuard SL is your official digital gateway for reporting,
                monitoring, and emergency assistance. Fast, reliable, and secure.
              </p>
              <div className="buttons">
                <Link href="/Login">
                  <button className="btn-primary" style={{ padding: "16px 36px", height: "auto" }}>
                    Report Incident
                    <ArrowRight size={18} style={{ marginLeft: "12px" }} />
                  </button>
                </Link>
              </div>
            </div>

            {/* Background Accent */}
            <div style={{
              position: "absolute", bottom: "-20%", right: "-10%", width: "50%", height: "50%",
              background: "radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)",
              filter: "blur(40px)", pointerEvents: "none", zIndex: 0
            }}></div>
          </motion.div>

          {/* Safety Trust Marker Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bento-item bento-col-4 bento-row-1"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.1em", color: "var(--fg-secondary)" }}>SYSTEM INTEGRITY</div>
              <div className="status-dot" style={{ background: "var(--accent-emerald)" }}></div>
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: 950, color: "white", marginBottom: "4px" }}>100%</div>
            <div style={{ color: "var(--fg-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>Official Digital Channel</div>

            <div style={{ marginTop: "auto", display: "flex", gap: "4px", height: "12px", alignItems: "flex-end" }}>
              {[...Array(24)].map((_, i) => (
                <div key={i} style={{ flex: 1, background: "var(--primary)", opacity: 0.2 + (i * 0.03), height: `${40 + (i * 2)}%`, borderRadius: "1px" }}></div>
              ))}
            </div>
          </motion.div>

          {/* Official Bulletins Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bento-item bento-col-4 bento-row-1"
            style={{
              background: "linear-gradient(135deg, rgba(10, 12, 18, 0.4) 0%, rgba(59, 130, 246, 0.05) 100%)"
            }}
          >
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "20px" }}>
              <Radio size={16} color="var(--primary)" />
              <div style={{ fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.1em", color: "var(--fg-secondary)" }}>OFFICIAL BULLETINS</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Secure Digital Complaint Filing", type: "Active" },
                { label: "Online Police Report Requests", type: "Official" },
                { label: "Emergency Contact Database", type: "Updated" }
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "8px 0", borderBottom: i === 2 ? "none" : "1px solid var(--border-light)" }}>
                  <span style={{ color: "white", fontWeight: 600 }}>{item.label}</span>
                  <span style={{ color: "var(--primary)", fontWeight: 800, fontSize: "0.65rem", textTransform: "uppercase" }}>{item.type}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
