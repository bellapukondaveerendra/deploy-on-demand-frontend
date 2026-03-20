import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBars, FaTimes, FaHome, FaRocket, FaCreditCard,
  FaSignOutAlt, FaExternalLinkAlt, FaEye, FaRedo,
  FaTrash, FaSync, FaChevronRight,
} from "react-icons/fa";
import Dashboard from "./Dashboard";
import Subscription from "./Subscription";
import "./MainDashboard.css";

const API = "http://localhost:9000";

const STATUS_MAP = {
  SUCCESS:   "badge-success",
  RUNNING:   "badge-running",
  PENDING:   "badge-pending",
  FAILED:    "badge-failed",
  SCHEDULED: "badge-pending",
};

function statusBadge(status) {
  const cls = STATUS_MAP[status] || "badge-unknown";
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function MainDashboard() {
  const [sidebarOpen,      setSidebarOpen]      = useState(true);
  const [tab,              setTab]              = useState("home");
  const [deployments,      setDeployments]      = useState([]);
  const [depsLoading,      setDepsLoading]      = useState(false);
  const [reachedLimit,     setReachedLimit]     = useState(false);
  const [logs,             setLogs]             = useState([]);
  const [logsModal,        setLogsModal]        = useState(false);
  const [selectedRepoId,   setSelectedRepoId]   = useState(null);
  const [logsLoading,      setLogsLoading]      = useState(false);
  const [limitPopup,       setLimitPopup]       = useState(false);
  const [redoTarget,       setRedoTarget]       = useState(null);
  const [redoConfirmed,    setRedoConfirmed]    = useState(false);
  const [redoLoading,      setRedoLoading]      = useState(false);

  const username = sessionStorage.getItem("username") || "User";
  const navigate = useNavigate();
  const token = () => sessionStorage.getItem("token");

  // ── Fetch deployment history ──────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setDepsLoading(true);
    try {
      const res = await axios.get(`${API}/deployment_history`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setDeployments(res.data.deployments);
      setReachedLimit(res.data.reached_limit);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setDepsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "deployments") fetchHistory();
  }, [tab, fetchHistory]);

  // ── Logs ──────────────────────────────────────────────────────────────────
  const fetchLogs = async (repoId) => {
    setLogsLoading(true);
    setLogs([]);
    try {
      const res = await axios.get(`${API}/docker-logs/${repoId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setLogs(res.data.logs || ["No logs available."]);
    } catch (err) {
      setLogs([`Error: ${err.response?.data?.detail || "Failed to fetch logs."}`]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleViewLogs = (repoId) => {
    setSelectedRepoId(repoId);
    setLogsModal(true);
    fetchLogs(repoId);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (repoId) => {
    if (!window.confirm("Delete this deployment? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/delete_deployment/${repoId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setDeployments(prev => prev.filter(d => d.repo_id !== repoId));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete deployment.");
    }
  };

  // ── Redo ──────────────────────────────────────────────────────────────────
  const handleRedo = (dep) => {
    if (reachedLimit) { setLimitPopup(true); return; }
    setRedoTarget(dep);
    setRedoConfirmed(false);
  };

  const confirmRedo = async () => {
    if (!redoTarget || !redoConfirmed) return;
    setRedoLoading(true);
    try {
      const fd = new FormData();
      fd.append("repo_url",          redoTarget.repo_url);
      fd.append("deployment_name",   redoTarget.deployment_name);
      fd.append("is_backend_service",redoTarget.is_backend_service);
      fd.append("is_env_given",      redoTarget.is_env_given);
      await axios.post(`${API}/deploy`, fd, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      alert("✅ Redeployment successful!");
      setRedoTarget(null);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.detail || "Redeployment failed.");
    } finally {
      setRedoLoading(false);
    }
  };

  const handleNewDeployment = () => {
    if (reachedLimit) { setLimitPopup(true); return; }
    setTab("new");
  };

  // ── Sidebar items ─────────────────────────────────────────────────────────
  const navItems = [
    { id: "home",        label: "Home",        icon: <FaHome /> },
    { id: "new",         label: "New Deploy",  icon: <FaRocket /> },
    { id: "deployments", label: "Deployments", icon: <FaChevronRight /> },
    { id: "subscription",label: "Subscription",icon: <FaCreditCard /> },
  ];

  return (
    <div className="md-root">
      {/* ── Sidebar ── */}
      <aside className={`md-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="md-sidebar-top">
          <button className="md-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          {sidebarOpen && <span className="md-brand">DOD<span className="md-brand-dot">.</span></span>}
        </div>

        <nav className="md-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`md-nav-item ${tab === item.id ? "active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              <span className="md-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="md-nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <button
          className="md-logout"
          onClick={() => { sessionStorage.clear(); navigate("/"); }}
        >
          <FaSignOutAlt />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="md-main">
        <header className="md-topbar">
          <h1 className="md-topbar-title">
            {tab === "home"         && "Overview"}
            {tab === "new"          && "New Deployment"}
            {tab === "deployments"  && "Deployments"}
            {tab === "subscription" && "Subscription"}
          </h1>
          <div className="md-topbar-user">
            <span className="md-avatar">{username[0].toUpperCase()}</span>
            <span className="md-username">{username}</span>
          </div>
        </header>

        <div className="md-content">
          {/* ── Home ── */}
          {tab === "home" && (
            <div className="md-home">
              <div className="md-stat-grid">
                <div className="md-stat-card">
                  <span className="md-stat-label">Total Deployments</span>
                  <span className="md-stat-value">{deployments.length || "—"}</span>
                </div>
                <div className="md-stat-card">
                  <span className="md-stat-label">Tier</span>
                  <span className="md-stat-value">{reachedLimit ? "⚠ Limit Reached" : "Free"}</span>
                </div>
                <div className="md-stat-card">
                  <span className="md-stat-label">Last Deployed</span>
                  <span className="md-stat-value" style={{ fontSize: "14px" }}>
                    {deployments[0]
                      ? new Date(deployments[0].timestamp).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="md-home-actions">
                <button className="btn-primary" onClick={handleNewDeployment}>
                  <FaRocket /> New Deployment
                </button>
                <button className="btn-ghost" onClick={() => setTab("deployments")}>
                  View History →
                </button>
              </div>
            </div>
          )}

          {/* ── New Deployment ── */}
          {tab === "new" && <Dashboard />}

          {/* ── Deployments ── */}
          {tab === "deployments" && (
            <div className="md-deps">
              <div className="md-deps-toolbar">
                <button className="btn-primary" onClick={handleNewDeployment}>
                  <FaRocket /> New Deployment
                </button>
                <button className="btn-ghost" onClick={fetchHistory}>
                  <FaSync /> Refresh
                </button>
              </div>

              {depsLoading ? (
                <div className="md-loading">Loading deployments…</div>
              ) : deployments.length === 0 ? (
                <div className="md-empty">
                  <FaRocket style={{ fontSize: 32, marginBottom: 12, color: "var(--text-muted)" }} />
                  <p>No deployments yet. Create your first one!</p>
                </div>
              ) : (
                <div className="md-dep-list">
                  {deployments.map(dep => (
                    <div key={dep.repo_id} className="md-dep-card">
                      <div className="md-dep-card-left">
                        <div className="md-dep-name">{dep.deployment_name}</div>
                        <div className="md-dep-repo">{dep.repo_url}</div>
                        {dep.public_url && (
                          <a
                            href={dep.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="md-dep-url"
                          >
                            {dep.public_url} ↗
                          </a>
                        )}
                        <div className="md-dep-meta">
                          {statusBadge(dep.status)}
                          <span className="md-dep-time">
                            {new Date(dep.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="md-dep-actions">
                        {dep.public_url && (
                          <button
                            className="md-icon-btn"
                            title="Open URL"
                            onClick={() => window.open(dep.public_url, "_blank")}
                          >
                            <FaExternalLinkAlt />
                          </button>
                        )}
                        <button
                          className="md-icon-btn"
                          title="View logs"
                          onClick={() => handleViewLogs(dep.repo_id)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="md-icon-btn"
                          title="Redeploy"
                          onClick={() => handleRedo(dep)}
                        >
                          <FaRedo />
                        </button>
                        <button
                          className="md-icon-btn danger"
                          title="Delete"
                          onClick={() => handleDelete(dep.repo_id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Subscription ── */}
          {tab === "subscription" && <Subscription />}
        </div>
      </main>

      {/* ── Logs Modal ── */}
      {logsModal && (
        <>
          <div className="md-overlay" onClick={() => setLogsModal(false)} />
          <div className="md-logs-modal">
            <div className="md-logs-modal-header">
              <span>Docker Logs — {selectedRepoId}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-ghost"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  onClick={() => fetchLogs(selectedRepoId)}
                >
                  <FaSync /> Refresh
                </button>
                <button
                  className="btn-ghost"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  onClick={() => setLogsModal(false)}
                >
                  <FaTimes /> Close
                </button>
              </div>
            </div>
            <div className="md-logs-body">
              {logsLoading
                ? <div className="md-log-line">Loading…</div>
                : logs.map((l, i) => <div key={i} className="md-log-line">{l}</div>)
              }
            </div>
          </div>
        </>
      )}

      {/* ── Limit Popup ── */}
      {limitPopup && (
        <>
          <div className="md-overlay" onClick={() => setLimitPopup(false)} />
          <div className="md-popup">
            <h3 className="md-popup-title">Deployment Limit Reached</h3>
            <p className="md-popup-body">
              Free tier allows <strong>3 active deployments</strong>.
              Upgrade to Premium for unlimited deployments.
            </p>
            <div className="md-popup-actions">
              <button
                className="btn-primary"
                onClick={() => { setLimitPopup(false); setTab("subscription"); }}
              >
                Upgrade to Premium
              </button>
              <button className="btn-ghost" onClick={() => setLimitPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Redo Confirmation ── */}
      {redoTarget && (
        <>
          <div className="md-overlay" onClick={() => setRedoTarget(null)} />
          <div className="md-popup">
            <h3 className="md-popup-title">⚠ Confirm Redeploy</h3>
            <p className="md-popup-body">
              This will create a new deployment of <strong>{redoTarget.deployment_name}</strong>
              {" "}and count toward your deployment limit.
            </p>
            <label className="md-redo-check">
              <input
                type="checkbox"
                checked={redoConfirmed}
                onChange={e => setRedoConfirmed(e.target.checked)}
              />
              I understand the consequences
            </label>
            <div className="md-popup-actions">
              <button
                className="btn-primary"
                onClick={confirmRedo}
                disabled={!redoConfirmed || redoLoading}
              >
                {redoLoading ? "Deploying…" : "Confirm"}
              </button>
              <button className="btn-ghost" onClick={() => setRedoTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}