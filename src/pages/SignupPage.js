import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";
import axios from "axios";

function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    purpose: "Own Project",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:9000/signup", {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phoneNumber,
      });

      if (res.status === 201 || res.status === 200) {
        // Assuming 201 for successful creation
        sessionStorage.setItem("token", res.data.access_token);
        alert("Signup successful!");
        navigate("/login");
      } else {
        alert(`Error: ${res.data.message || "Unknown error occurred"}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert(`Signup failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div id="signup-page-container">
      <div className="signup-animated-background"></div>
      <div id="signup-card">
        <h1 id="signup-title">Sign Up</h1>
        <form onSubmit={handleSignup}>
          <div className="signup-input-group">
            <label htmlFor="signup-name">Name</label>
            <input
              type="text"
              id="signup-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="signup-input-group">
            <label htmlFor="signup-email">Email</label>
            <input
              type="email"
              id="signup-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="signup-input-group">
            <label htmlFor="signup-password">Password</label>
            <input
              type="password"
              id="signup-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="signup-input-group">
            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <input
              type="password"
              id="signup-confirm-password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="signup-input-group">
            <label htmlFor="signup-phone">Phone Number</label>
            <input
              type="tel"
              id="signup-phone"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" id="signup-button">
            Sign Up
          </button>
        </form>
        <p id="signup-login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
