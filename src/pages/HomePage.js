import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import backgroundImage from "../assets/background.png";
import "./HomePage.css";

function HomePage() {
  return (
    <div id="homepage-container">
      <div id="homepage-overlay"></div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        id="homepage-content"
      >
        <h1 id="homepage-title">Deploy-On-Demand 🚀</h1>
        <p id="homepage-subtitle">A Self Hosting Service</p>
        <p id="homepage-description">
          Instantly deploy your app from GitHub with just one click.
        </p>

        {/* Animated Rocket Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ y: 0 }}
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Link to="/login">
            <button id="homepage-start-button">Let's Start 🚀</button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HomePage;
