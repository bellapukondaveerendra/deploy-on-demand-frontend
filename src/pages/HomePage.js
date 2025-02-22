import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome to Deploy-On-Demand 🚀</h1>
      <p>Instantly deploy your app from GitHub.</p>
      <Link to="/dashboard">
        <button style={{ padding: "10px 20px", fontSize: "18px" }}>
          Get Started
        </button>
      </Link>
    </div>
  );
}

export default HomePage;
