"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const services = [
  { title: "Emergency Assistance", desc: "Immediate access to emergency services with real-time tracking and updates.", img: "/service1.jpg" },
  { title: "Community Alerts", desc: "Receive timely alerts about incidents and safety concerns in your area.", img: "/service2.jpg" },
  { title: "Safety Resources", desc: "Access valuable resources and information on safety and crime prevention.", img: "/service3.jpg" },
];

export default function Services() {
  return (
    <div className="grid-standard">
      {services.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.8 }}
          className="glass-card"
          style={{ padding: "0", overflow: "hidden" }}
        >
          <div style={{ position: "relative", height: "240px" }}>
            <Image src={s.img} alt={s.title} layout="fill" objectFit="cover" />
            <div style={{
              position: "absolute",
              inset: "0",
              background: "linear-gradient(to bottom, transparent 50%, rgba(11, 14, 20, 0.8))"
            }} />
          </div>
          <div style={{ padding: "32px" }}>
            <h3 style={{ marginBottom: "16px", fontSize: "1.4rem" }}>{s.title}</h3>
            <p style={{ color: "var(--fg-secondary)", fontSize: "1rem", lineHeight: "1.6" }}>{s.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
