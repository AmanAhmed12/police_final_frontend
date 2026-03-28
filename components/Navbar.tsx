"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      className="navbar"
    >
      <div className="navbar-inner">
        <div className="brand">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="logo-box"
          >
            C
          </motion.div>
          <span style={{ fontWeight: 900, fontSize: "1.3rem", letterSpacing: "-0.03em" }}>CityGuard</span>
        </div>

        <nav className="nav-links">
          {["Home", "Services", "About Us", "Contact"].map((item) => (
            <Link
              key={item}
              href={item === "Home" ? "#main" : `#${item.toLowerCase().replace(" ", "")}`}
            >
              <motion.span whileHover={{ y: -1 }} style={{ display: "inline-block" }}>
                {item}
              </motion.span>
            </Link>
          ))}
        </nav>

        <div className="action-buttons" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/Login">
            <button className="btn-secondary" style={{ padding: "10px 22px", borderRadius: "12px", fontSize: "0.9rem" }}>Sign In</button>
          </Link>
          <Link href="/Register">
            <button className="btn-primary" style={{ padding: "10px 22px", borderRadius: "12px", fontSize: "0.9rem" }}>Get Started</button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
