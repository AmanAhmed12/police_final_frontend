"use client";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Services from "../components/Services";
import CallToAction from "../components/CallToAction";
import AboutUs from "../components/AboutUs";
import ContactUs from "../components/Contact";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div style={{ position: "relative" }}>
      <Navbar />
      <main id="main">
        <Hero />

        <section id="howitworks" className="container">
          <div className="section-title">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ color: "var(--primary)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: "16px", display: "block" }}
            >
              OUR FEATURES
            </motion.span>
            <h2>How CityGuard Works</h2>
            <p className="section-sub">
              Our platform connects you with local law enforcement and emergency services,
              ensuring rapid response and support.
            </p>
          </div>
          <HowItWorks />
        </section>

        <section id="services" className="container">
          <div className="section-title">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ color: "var(--primary)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: "16px", display: "block" }}
            >
              CORE SERVICES
            </motion.span>
            <h2>Our Services</h2>
            <p className="section-sub">
              CityGuard offers a range of services designed to enhance community safety and
              security.
            </p>
          </div>
          <Services />
        </section>

        <AboutUs />
        <ContactUs />
        <CallToAction />

      </main>
      <Footer />
    </div>
  );
}
