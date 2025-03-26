import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:9000/login", {
        email: email,
        password: password,
      });

      if ([201, 200].includes(res.status)) {
        // Assuming 201 for successful creation
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("token", res.data.access_token);
        navigate("/maindashboard");
      } else {
        alert(`Error: ${res.data.message || "Unknown error occurred"}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Navigate to Signup Page
        alert("User not found! Redirecting to signup...");
        navigate("/signup");
      } else {
        console.error("Invalid credentials. Please try again:", error);
        alert(
          `Login failed: ${error.response?.data?.message || error.message}`
        );
      }
    }
  };

  return (
    <div id="loginpage-container">
      <div className="loginpage-animated-background"></div>
      <div id="loginpage-card">
        <h1 id="loginpage-title">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="loginpage-input-group">
            <label htmlFor="loginpage-email">Email</label>
            <input
              type="email"
              id="loginpage-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="loginpage-input-group">
            <label htmlFor="loginpage-password">Password</label>
            <input
              type="password"
              id="loginpage-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" id="loginpage-button">
            Login
          </button>
        </form>
        <p id="loginpage-signup-link">
          New user? <span onClick={() => navigate("/signup")}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
