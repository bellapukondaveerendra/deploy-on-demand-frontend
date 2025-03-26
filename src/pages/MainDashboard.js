import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MainDashboard.css";
import Subscription from "./Subscription";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaTasks,
  FaClipboardList,
  FaSignOutAlt,
  FaEye,
  FaRedo,
  FaTrash,
  FaExternalLinkAlt,
} from "react-icons/fa";

function MainDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState("Home");
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [reachedLimit, setReachedLimit] = useState(false); // New Limit Flag
  const [showPopup, setShowPopup] = useState(false); // State for Popup
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [deploymentToRedo, setDeploymentToRedo] = useState(null);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false); // ✅ Added this

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleClick = () => {
    navigate("/dashboard");
  };

  const handleViewLogs = async (repo_id) => {
    try {
      setSelectedRepoId(repo_id);
      await fetchLogs(repo_id);
      setShowLogsModal(true);
    } catch (error) {
      alert(
        `Failed to fetch logs: ${
          error.response?.data?.error || "Unknown error"
        }`
      );
    }
  };

  const fetchLogs = async (repo_id) => {
    try {
      const res = await axios.get(
        `http://localhost:9000/docker-logs/${repo_id}`
      );
      setLogs(res.data.logs || ["No logs available."]);
    } catch (error) {
      alert(
        `Failed to fetch logs: ${
          error.response?.data?.error || "Unknown error"
        }`
      );
    }
  };

  const handleRefreshLogs = async () => {
    if (selectedRepoId) {
      await fetchLogs(selectedRepoId);
    }
  };

  const handleRedoDeployment = async (deployment) => {
    if (reachedLimit) {
      // 🚨 Show Premium Upgrade Popup
      setShowPopup(true);
      return;
    }

    // Show Confirmation Modal
    setDeploymentToRedo(deployment);
    setShowConfirmationModal(true);
  };

  const confirmRedoDeployment = async () => {
    if (!deploymentToRedo) return;

    try {
      const token = sessionStorage.getItem("token");

      const formData = new FormData();
      formData.append("repo_url", deploymentToRedo.repo_url);
      formData.append("is_env_given", deploymentToRedo.is_env_given);
      formData.append(
        "is_backend_service",
        deploymentToRedo.is_backend_service
      );
      formData.append("deployment_name", deploymentToRedo.deployment_name);

      if (deploymentToRedo.env_file) {
        formData.append("env_file", deploymentToRedo.env_file);
      }

      await axios.post("http://localhost:9000/deploy", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Redeployment successful!");
      setShowConfirmationModal(false);
    } catch (error) {
      console.error("❌ Redeployment failed:", error);
      alert(
        `❌ Failed to redeploy: ${
          error.response?.data?.detail || "Unknown error"
        }`
      );
    }
  };

  // ❌ Delete Deployment Function
  const handleDeleteDeployment = async (repo_id) => {
    if (!window.confirm("Are you sure you want to delete this deployment?")) {
      return; // Prevent accidental deletions
    }

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        alert("Token missing. Please log in again.");
        return;
      }

      const res = await axios.delete(
        `http://localhost:9000/delete_deployment/${repo_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Deployment deleted successfully!");

      // Remove from UI for smoother experience
      setDeployments((prev) => prev.filter((d) => d.repo_id !== repo_id));
    } catch (error) {
      console.error("❌ Error deleting deployment:", error);
      alert(
        `❌ Failed to delete deployment: ${
          error.response?.data?.detail || "Unknown error"
        }`
      );
    }
  };

  // Fetch Deployment History from Backend
  useEffect(() => {
    const fetchDeploymentHistory = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          alert("Token missing. Please log in again.");
          return;
        }

        const res = await axios.get(
          "http://localhost:9000/deployment_history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(
          "res.data.deploymentsres.data.deployments",
          res.data.deployments
        );
        setDeployments(res.data.deployments);
        setReachedLimit(res.data.reached_limit); // ✅ Track Deployment Limit
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching deployment history:", error);
        alert("Failed to load deployment history.");
        setLoading(false);
      }
    };

    if (selectedTab === "Deployments") {
      fetchDeploymentHistory();
    }
  }, [selectedTab]);

  const handleNewDeployment = () => {
    if (reachedLimit) {
      // 🚨 Show the Popup when the limit is reached
      setShowPopup(true);
      return;
    }

    // 🚀 Proceed with New Deployment Flow
    navigate("/dashboard");
  };

  return (
    <div className="main-dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="hamburger-menu" onClick={toggleSidebar}>
          <FaBars />
        </div>
        <nav>
          <ul>
            <li
              className={selectedTab === "Home" ? "active" : ""}
              onClick={() => setSelectedTab("Home")}
            >
              <FaHome /> {isSidebarOpen && "Home"}
            </li>
            <li
              className={selectedTab === "Deployments" ? "active" : ""}
              onClick={() => setSelectedTab("Deployments")}
            >
              <FaTasks /> {isSidebarOpen && "Deployments"}
            </li>
            <li
              className={selectedTab === "Subscription" ? "active" : ""}
              onClick={() => setSelectedTab("Subscription")}
            >
              <FaClipboardList /> {isSidebarOpen && "Subscription"}
            </li>
            <li className="logout-button">
              <FaSignOutAlt /> {isSidebarOpen && "Logout"}
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="welcome-header">Welcome, Veerendra!</header>

        {/* Conditional Rendering for Selected Sections */}
        {selectedTab === "Home" && (
          <section className="home-section">
            <h2>Deployment Overview</h2>
            <p>Total Deployments: {deployments.length}</p>
            <p>
              Status:{" "}
              {deployments.length > 0 ? "In Progress" : "No Deployments Yet"}
            </p>
            <p>
              Last Deployment:{" "}
              {deployments.length > 0
                ? new Date(deployments[0]?.timestamp).toLocaleString()
                : "N/A"}
            </p>
          </section>
        )}

        {selectedTab === "Deployments" && (
          <section className="deployments-section">
            <h2>Deployments</h2>
            <button
              className="new-deployment-button"
              onClick={handleNewDeployment}
            >
              New Deployment
            </button>

            {/* 🚨 Popup Modal for Deployment Limit */}
            {showPopup && (
              <div className="popup-overlay">
                <div className="popup-content">
                  <h2>Deployment Limit Reached</h2>
                  <p>
                    You've reached your limit of <b>3 successful deployments</b>
                    .
                  </p>
                  <p>
                    Upgrade to Premium for <b>unlimited deployments</b>.
                  </p>

                  <div className="popup-buttons">
                    <button
                      onClick={() => navigate("/subscription")}
                      className="upgrade-button"
                    >
                      Upgrade to Premium
                    </button>

                    <button
                      onClick={() => setShowPopup(false)}
                      className="close-button"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Deployment List */}
            {loading ? (
              <p>Loading deployments...</p>
            ) : deployments.length === 0 ? (
              <p>No deployments found.</p>
            ) : (
              deployments.map((deployment) => (
                <div
                  className={`deployment-card ${
                    deployment.status === "EXPIRED" ? "expired-deployment" : ""
                  }`}
                >
                  <span>
                    <strong>{deployment.deployment_name}</strong> -{" "}
                    {deployment.status}
                  </span>
                  <p>
                    <b>Repo:</b> {deployment.repo_url} <br />
                    <b>URL:</b>{" "}
                    <a
                      href={deployment.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {deployment.public_url}
                    </a>
                  </p>
                  <div className="deployment-icons">
                    <FaExternalLinkAlt
                      onClick={() =>
                        window.open(deployment.public_url, "_blank")
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <FaEye onClick={() => handleViewLogs(deployment.repo_id)} />
                    <FaRedo onClick={() => handleRedoDeployment(deployment)} />
                    <FaTrash
                      onClick={() => handleDeleteDeployment(deployment.repo_id)}
                    />
                  </div>
                </div>
              ))
            )}

            {/* 👁️ Logs Modal */}
            {showLogsModal && (
              <div className="logs-modal">
                <div className="modal-content">
                  <h3>Deployment Logs</h3>
                  <pre>
                    {logs.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))}
                  </pre>
                  <div className="modal-buttons">
                    <button onClick={handleRefreshLogs}>🔄 Refresh</button>
                    <button onClick={() => setShowLogsModal(false)}>
                      ❌ Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ✅ Confirmation Modal */}
        {showConfirmationModal && (
          <div className="confirmation-modal">
            <div className="modal-content">
              <h3>⚠️ Are you sure you want to redeploy?</h3>
              <p>Redeploying may overwrite the current deployment state.</p>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="confirmCheckbox"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                />
                <label htmlFor="confirmCheckbox">
                  I understand the consequences
                </label>
              </div>
              <div className="modal-buttons">
                <button
                  onClick={confirmRedoDeployment}
                  disabled={!confirmCheckbox}
                >
                  ✅ Confirm
                </button>
                <button onClick={() => setShowConfirmationModal(false)}>
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "Subscription" && <Subscription />}
      </div>
    </div>
  );
}

export default MainDashboard;
