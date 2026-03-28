"use client";

import { useState } from "react";
import Link from "next/link";
import { Twitter, Facebook, Instagram, Github, Mail, Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FooterLink = {
  name: string;
  href?: string;
  action?: () => void;
};

export default function Footer() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const openTermsModal = () => setIsTermsModalOpen(true);
  const closeTermsModal = () => setIsTermsModalOpen(false);

  const openPrivacyModal = () => setIsPrivacyModalOpen(true);
  const closePrivacyModal = () => setIsPrivacyModalOpen(false);

  const navigation: Record<string, FooterLink[]> = {
    product: [
      { name: "Complaints", href: "#howitworks" },
      { name: "Suspect Search", href: "#howitworks" },
      { name: "Police Reports", href: "#howitworks" },
      { name: "AI Insights", href: "#services" },
    ],
    support: [
      { name: "Emergency Assistance", href: "#services" },
      { name: "Safety Resources", href: "#services" },
      { name: "Community Alerts", href: "#services" },
      { name: "Contact Us", href: "#contact" },
    ],
    company: [
      { name: "About CityGuard", href: "#aboutus" },
      { name: "Our Mission", href: "#aboutus" },
      { name: "Our Vision", href: "#aboutus" },
    ],
    legal: [
      { name: "Privacy Policy", action: openPrivacyModal },
      { name: "Terms of Service", action: openTermsModal },
    ],
  };

  return (
    <footer className="footer" style={{
      borderTop: "1px solid var(--border-light)",
      marginTop: "120px",
      padding: "100px 0 60px",
      background: "linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.02))"
    }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "40px 24px" }}>

          {/* Brand & Social */}
          <div style={{ gridColumn: "span 12", order: 5 } as any} className="footer-brand-col">
            <div className="brand" style={{ marginBottom: "28px" }}>
              <div className="logo-box">C</div>
              <span style={{ fontWeight: 950, fontSize: "1.5rem", letterSpacing: "-0.04em" }}>CityGuard SL</span>
            </div>
            <p style={{
              color: "var(--fg-secondary)",
              fontSize: "0.95rem",
              lineHeight: "1.7",
              maxWidth: "320px",
              marginBottom: "32px",
              fontWeight: 500
            }}>
              Advancing public safety through innovative digital solutions.
              The official bridge between the community and Sri Lanka Police.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              {[Twitter, Facebook, Instagram, Github].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -4, color: "var(--primary)", borderColor: "var(--primary)" }}
                  style={{
                    color: "var(--fg-secondary)",
                    background: "rgba(255,255,255,0.02)",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-light)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Nav Links Grid */}
          <div style={{ gridColumn: "span 12" } as any}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "40px"
            }}>
              {Object.entries(navigation).map(([category, links]) => (
                <div key={category}>
                  <h4 className="footer-title">{category}</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {links.map((link) => (
                      link.action ? (
                        <button
                          key={link.name}
                          onClick={(e) => { e.preventDefault(); link.action!(); }}
                          className="footer-link"
                          style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: "0" }}
                        >
                          {link.name}
                        </button>
                      ) : (
                        itemHrefHelper(link.name, link.href || "#")
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div style={{
          marginTop: "100px",
          paddingTop: "32px",
          borderTop: "1px solid var(--border-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px"
        }}>
          <p style={{ color: "var(--fg-secondary)", fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.01em" }}>
            © {new Date().getFullYear()} CityGuard Sri Lanka. All Rights Reserved.
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--fg-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 12px rgba(16, 185, 129, 0.4)" }}></div>
              Network Status: Online
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isTermsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={closeTermsModal}
            style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 9999, backdropFilter: "blur(24px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              className="glass-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "600px", width: "95%", maxHeight: "85vh", overflowY: "auto", border: "1px solid var(--border-light)", padding: "48px" }}
            >
              <h2 style={{ color: "white", marginBottom: "2rem", fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.02em" }}>Terms of Service</h2>
              <div style={{ color: "var(--fg-secondary)", fontSize: "1rem", display: "flex", flexDirection: "column", gap: "1.4rem", lineHeight: "1.8" }}>
                <p>By accessing the CityGuard platform, you acknowledge and agree to the following terms and conditions designed to ensure community safety and system integrity.</p>
                <p><strong>1. Responsible Use:</strong> Users are strictly prohibited from filing false reports. Any attempt to deceive law enforcement through this digital portal will result in immediate legal consequences.</p>
                <p><strong>2. Data Privacy:</strong> We employ end-to-end encryption for all sensitive submissions. Your identity is protected under Sri Lankan cyber-security regulations.</p>
              </div>
              <button
                className="btn-primary"
                onClick={closeTermsModal}
                style={{ marginTop: "3rem", width: "100%", height: "54px", borderRadius: "14px", fontWeight: 800 }}
              >
                Accept Terms
              </button>
            </motion.div>
          </motion.div>
        )}

        {isPrivacyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={closePrivacyModal}
            style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 9999, backdropFilter: "blur(24px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              className="glass-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "600px", width: "95%", maxHeight: "85vh", overflowY: "auto", border: "1px solid var(--border-light)", padding: "48px" }}
            >
              <h2 style={{ color: "white", marginBottom: "2rem", fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.02em" }}>Privacy Policy</h2>
              <div style={{ color: "var(--fg-secondary)", fontSize: "1rem", display: "flex", flexDirection: "column", gap: "1.4rem", lineHeight: "1.8" }}>
                <p>Your security is our paramount concern. This policy outlines how CityGuard manages and protects the data provided during incident reporting and service requests.</p>
                <p><strong>1. Data Encryption:</strong> All informationtransmitted through this secure portal is encrypted using industry-standard protocols before reaching Sri Lanka Police servers.</p>
                <p><strong>2. Access Control:</strong> Only authorized law enforcement personnel can access sensitive complaint data for investigative purposes.</p>
              </div>
              <button
                className="btn-primary"
                onClick={closePrivacyModal}
                style={{ marginTop: "3rem", width: "100%", height: "54px", borderRadius: "14px", fontWeight: 800 }}
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}

function itemHrefHelper(name: string, href: string) {
  return (
    <Link key={name} href={href} className="footer-link">
      {name}
    </Link>
  );
}
