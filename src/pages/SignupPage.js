import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./AuthPages.css";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", phoneNumber: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:9000/signup", {
        username:     form.name,
        email:        form.email,
        password:     form.password,
        phone_number: form.phoneNumber,
      });
      if ([200, 201].includes(res.status)) {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-logo">DOD<span>.</span></span>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start deploying in minutes</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="auth-field">
            <label>Name</label>
            <input name="name" type="text" value={form.name} onChange={handle} placeholder="Your name" required />
          </div>
          <div className="auth-field">
            <label>Email address</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="Min. 6 characters" required />
          </div>
          <div className="auth-field">
            <label>Confirm password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handle} placeholder="Repeat password" required />
          </div>
          <div className="auth-field">
            <label>Phone number <span className="auth-optional">(optional)</span></label>
            <input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handle} placeholder="+1 555 000 0000" />
          </div>
          <button type="submit" className="auth-submit btn-primary" disabled={loading}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}