import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./HomePage.css";

const FEATURES = [
  { icon: "⚡", title: "One-Click Deploy",    desc: "Paste a GitHub URL. We handle the rest — clone, build, expose." },
  { icon: "🐳", title: "Docker Isolated",     desc: "Every deployment runs in its own container, fully isolated." },
  { icon: "🌐", title: "Instant Public URLs", desc: "ngrok tunnels give your app a live HTTPS URL in seconds." },
  { icon: "📅", title: "Scheduled Deploys",   desc: "Queue a deployment for any future time, minimum 30 min ahead." },
];

export default function HomePage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,58,237,${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="hp-root">
      <canvas ref={canvasRef} className="hp-canvas" />

      <nav className="hp-nav">
        <span className="hp-logo">DOD<span className="hp-logo-dot">.</span></span>
        <div className="hp-nav-links">
          <Link to="/login"  className="hp-nav-btn ghost">Sign In</Link>
          <Link to="/signup" className="hp-nav-btn primary">Get Started</Link>
        </div>
      </nav>

      <main className="hp-main">
        <motion.div
          className="hp-badge"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="hp-badge-dot" />
          Self-Hosted Deployment Platform
        </motion.div>

        <motion.h1
          className="hp-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Deploy Any Repo.<br />
          <span className="hp-title-accent">In Seconds.</span>
        </motion.h1>

        <motion.p
          className="hp-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Paste a GitHub URL. Get a live public HTTPS link.
          <br />Flask · Node.js · Static HTML — we detect and deploy automatically.
        </motion.p>

        <motion.div
          className="hp-cta-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/signup">
            <button className="hp-cta-primary">Launch Your App →</button>
          </Link>
          <Link to="/login">
            <button className="hp-cta-ghost">Sign In</button>
          </Link>
        </motion.div>

        <motion.div
          className="hp-terminal"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <div className="hp-terminal-bar">
            <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
            <span className="hp-terminal-title">deploy-on-demand</span>
          </div>
          <div className="hp-terminal-body">
            <div className="hp-terminal-line"><span className="c-prompt">$</span> dod deploy <span className="c-url">https://github.com/you/your-app</span></div>
            <div className="hp-terminal-line c-muted">  ✦ Cloning repository…</div>
            <div className="hp-terminal-line c-muted">  ✦ Detecting project type → Flask</div>
            <div className="hp-terminal-line c-muted">  ✦ Building Docker image…</div>
            <div className="hp-terminal-line c-muted">  ✦ Opening ngrok tunnel…</div>
            <div className="hp-terminal-line"><span className="c-green">✔</span> Live at <span className="c-url">https://abc123.ngrok.io</span></div>
          </div>
        </motion.div>
      </main>

      <section className="hp-features">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            className="hp-feature-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <span className="hp-feature-icon">{f.icon}</span>
            <h3 className="hp-feature-title">{f.title}</h3>
            <p className="hp-feature-desc">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      <footer className="hp-footer">
        <span>© 2025 Deploy-On-Demand</span>
        <span className="hp-footer-sep">·</span>
        <span>Built with FastAPI + React</span>
      </footer>
    </div>
  );
}