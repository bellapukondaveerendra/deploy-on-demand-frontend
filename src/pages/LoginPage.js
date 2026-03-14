import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:9000/login", {
        email,
        password,
      });

      if ([200, 201].includes(res.status)) {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("token", res.data.access_token);
        sessionStorage.setItem("user_id", res.data.user_id);
        sessionStorage.setItem("username", res.data.username);
        sessionStorage.setItem("email", res.data.email);
        navigate("/maindashboard");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError("No account found. Please sign up first.");
      } else if (error.response?.status === 401) {
        setError("Incorrect password. Please try again.");
      } else {
        setError(error.response?.data?.detail || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="loginpage-container">
      <div className="loginpage-animated-background"></div>
      <div id="loginpage-card">
        <h1 id="loginpage-title">Login</h1>

        {error && (
          <div style={{
            background: "#ffe0e0", border: "1px solid #f44", borderRadius: 8,
            padding: "10px 14px", marginBottom: 14, color: "#c00", fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}

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

          <button type="submit" id="loginpage-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
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