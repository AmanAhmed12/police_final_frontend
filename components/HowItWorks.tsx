"use client";

import { motion } from "framer-motion";

const features = [
  { icon: "🛡️", title: "File Complaints Online", desc: "Make Complaints with detailed information and media attachments." },
  { icon: "🕵️", title: "Find Matching Suspect", desc: "Find the Matching Suspect by providing details and matching with our database." },
  { icon: "📄", title: "Request Police Reports", desc: "Easily request official police reports and access case documents securely." },
  { icon: "🤖", title: "AI Legal Insights", desc: "Get instant insights into potential legal violations by interacting with our AI." },
  { icon: "📊", title: "Analysis Charts", desc: "Visualize trends and insights with interactive analysis charts for cases." },
  { icon: "📥", title: "Download Reports", desc: "Export detailed reports in PDF/CSV formats for offline review." },
];

export default function HowItWorks() {
  return (
    <div className="grid-standard">
      {features.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.8 }}
          className="glass-card"
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "28px" }}>{f.icon}</div>
          <h3 style={{ marginBottom: "16px", fontSize: "1.4rem" }}>{f.title}</h3>
          <p style={{ color: "var(--fg-secondary)", fontSize: "1rem", lineHeight: "1.6" }}>{f.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
