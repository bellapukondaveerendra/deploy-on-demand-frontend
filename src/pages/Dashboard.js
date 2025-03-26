// import React, { useState } from "react";
// import axios from "axios";
// import { FaRocket, FaSync, FaFileAlt, FaServer } from "react-icons/fa";
// import "./Dashboard.css";
// import ReactDatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import Modal from "react-modal";

// const Dashboard = () => {
//   const [repoUrl, setRepoUrl] = useState("");
//   const [deploymentName, setDeploymentName] = useState("");
//   const [deploymentId, setDeploymentId] = useState("");
//   const [isEnvGiven, setIsEnvGiven] = useState(false);
//   const [isBackendService, setIsBackendService] = useState(false);
//   const [envFile, setEnvFile] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [deploymentStatus, setDeploymentStatus] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [scheduleTime, setScheduleTime] = useState(null);

//   // ⏰ Only allow future times 30 mins from now
//   const minSelectableTime = new Date(Date.now() + 30 * 60 * 1000);

//   const handleDeploy = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setLogs([]);
//     setDeploymentStatus("");

//     const formData = new FormData();
//     formData.append("repo_url", repoUrl);
//     formData.append("is_backend_service", isBackendService);
//     formData.append("is_env_given", isEnvGiven);
//     formData.append("deployment_name", deploymentName);

//     if (isEnvGiven && envFile) {
//       formData.append("env_file", envFile);
//     }

//     try {
//       const token = sessionStorage.getItem("token");
//       const res = await axios.post("http://localhost:9000/deploy", formData, {
//         headers: {
//           Authorization: `Bearer ${token}`, // Sending token in Authorization header
//         },
//       });

//       if (res.data.deploy_id && isBackendService) {
//         setDeploymentId(res.data.deploy_id);
//         setDeploymentStatus(
//           "✅ Deployment successful! Logs will appear below."
//         );
//         fetchDockerLogs(res.data.deploy_id);
//       } else {
//         setDeploymentStatus(
//           `✅ Deployment successful! Visit the public URL. ${res.data.public_url}`
//         );
//       }
//     } catch (error) {
//       setDeploymentStatus("❌ Deployment failed!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDockerLogs = async (repoId) => {
//     try {
//       const res = await axios.get(
//         `http://localhost:9000/docker-logs/${repoId}`
//       );

//       if (res.data.logs) {
//         setLogs(res.data.logs);
//       } else {
//         alert("⚠️ No logs found.");
//       }
//     } catch (error) {
//       alert("Failed to fetch logs.");
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       {/* 🚀 Deployment Section */}
//       <div className="dashboard-deployment-section">
//         <h2>🚀 Deploy Your Project</h2>
//         <form onSubmit={handleDeploy} className="dashboard-deploy-form">
//           <div className="dashboard-input-group">
//             <input
//               type="text"
//               value={deploymentName}
//               onChange={(e) => setDeploymentName(e.target.value)}
//               placeholder="Name for your Deployment"
//               required
//             />
//           </div>

//           <div className="dashboard-input-group">
//             <input
//               type="text"
//               value={repoUrl}
//               onChange={(e) => setRepoUrl(e.target.value)}
//               placeholder="Enter GitHub repo URL"
//               required
//             />
//           </div>

//           {/* ✅ `.env` Upload Option */}
//           <div className="dashboard-input-group">
//             <label>
//               <FaFileAlt /> Do you have an `.env` file?
//             </label>
//             <select
//               value={isEnvGiven}
//               onChange={(e) => setIsEnvGiven(e.target.value === "true")}
//             >
//               <option value="false">No</option>
//               <option value="true">Yes</option>
//             </select>

//             {isEnvGiven && (
//               <input
//                 type="file"
//                 accept=".env"
//                 onChange={(e) => setEnvFile(e.target.files[0])}
//               />
//             )}
//           </div>

//           {/* ✅ Backend Service Section */}
//           <div className="dashboard-input-group">
//             <label>
//               <FaServer /> Backend Service?
//             </label>
//             <select
//               value={isBackendService}
//               onChange={(e) => setIsBackendService(e.target.value === "true")}
//             >
//               <option value="false">No (Public URL)</option>
//               <option value="true">Yes (Docker Logs)</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="dashboard-deploy-button"
//           >
//             {loading ? (
//               <>
//                 <FaRocket className="deploy-rocket-spin" /> Deploying...
//               </>
//             ) : (
//               <>
//                 <FaRocket /> Deploy Now
//               </>
//             )}
//           </button>
//           <button
//             type="button"
//             className="dashboard-schedule-button"
//             onClick={() => setIsModalOpen(true)}
//           >
//             📅 Schedule for Later
//           </button>
//         </form>
//       </div>

//       {/* 🔥 Logs Section (Visible if Backend Service = Yes) */}
//       {isBackendService && (
//         <div className="dashboard-logs-section">
//           <h3>📝 Real-Time Logs (Backend Service)</h3>

//           {!deploymentId && (
//             <p className="dashboard-info-message">
//               📢 Upon successful deployment, logs will appear below. Click{" "}
//               <b>Refresh Logs</b> for updates.
//             </p>
//           )}

//           {deploymentId && (
//             <button
//               className="dashboard-refresh-button"
//               onClick={() => fetchDockerLogs(deploymentId)}
//             >
//               <FaSync /> Refresh Logs
//             </button>
//           )}

//           <div className="dashboard-logs-container">
//             {logs.map((log, index) => (
//               <p key={index} className="dashboard-log-entry">
//                 {log}
//               </p>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ✅ Deployment Status Message */}
//       {deploymentStatus && (
//         <div className="dashboard-status-message">{deploymentStatus}</div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState } from "react";
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import { FaRocket, FaSync, FaFileAlt, FaServer } from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [deploymentName, setDeploymentName] = useState("");
  const [deploymentId, setDeploymentId] = useState("");
  const [isEnvGiven, setIsEnvGiven] = useState(false);
  const [isBackendService, setIsBackendService] = useState(false);
  const [envFile, setEnvFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const nowPlus30Min = new Date(Date.now() + 30 * 60 * 1000);

  const handleDeploy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setDeploymentStatus("");

    const formData = new FormData();
    formData.append("repo_url", repoUrl);
    formData.append("is_backend_service", isBackendService);
    formData.append("is_env_given", isEnvGiven);
    formData.append("deployment_name", deploymentName);

    if (isEnvGiven && envFile) {
      formData.append("env_file", envFile);
    }

    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post("http://localhost:9000/deploy", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.deploy_id && isBackendService) {
        setDeploymentId(res.data.deploy_id);
        setDeploymentStatus(
          "✅ Deployment successful! Logs will appear below."
        );
        fetchDockerLogs(res.data.deploy_id);
      } else {
        setDeploymentStatus(
          `✅ Deployment successful! Visit: ${res.data.public_url}`
        );
      }
    } catch (error) {
      setDeploymentStatus("❌ Deployment failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert("Please select both date and time.");
      return;
    }

    const combinedDateTime = new Date(scheduleDate);
    combinedDateTime.setHours(scheduleTime.getHours());
    combinedDateTime.setMinutes(scheduleTime.getMinutes());

    if (combinedDateTime < nowPlus30Min) {
      alert("Please pick a time at least 30 mins from now.");
      return;
    }

    const formattedDate = scheduleDate.toISOString().split("T")[0];

    const payload = {
      repo_url: repoUrl,
      is_backend_service: isBackendService,
      is_env_given: isEnvGiven,
      deployment_name: deploymentName,
      scheduled_date: formattedDate,
      scheduled_time: combinedDateTime.toISOString(),
    };

    try {
      const token = sessionStorage.getItem("token");
      await axios.post("http://localhost:9000/schedule", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Deployment scheduled successfully!");
      setIsModalOpen(false);
      setScheduleDate(null);
      setScheduleTime(null);
    } catch (error) {
      alert("❌ Failed to schedule deployment.");
    }
  };

  const fetchDockerLogs = async (repoId) => {
    try {
      const res = await axios.get(
        `http://localhost:9000/docker-logs/${repoId}`
      );
      if (res.data.logs) {
        setLogs(res.data.logs);
      } else {
        alert("⚠️ No logs found.");
      }
    } catch (error) {
      alert("Failed to fetch logs.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-deployment-section">
        <h2>🚀 Deploy Your Project</h2>
        <form onSubmit={handleDeploy} className="dashboard-deploy-form">
          <div className="dashboard-input-group">
            <label>
              <FaFileAlt /> Deployment Name
            </label>
            <input
              type="text"
              value={deploymentName}
              onChange={(e) => setDeploymentName(e.target.value)}
              placeholder="Name for your Deployment"
              required
            />
          </div>

          <div className="dashboard-input-group">
            <label>
              <FaFileAlt /> GitHub repo URL
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="Enter GitHub repo URL"
              required
            />
          </div>

          <div className="dashboard-input-group">
            <label>
              <FaFileAlt /> Do you have an `.env` file?
            </label>
            <select
              value={isEnvGiven}
              onChange={(e) => setIsEnvGiven(e.target.value === "true")}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>

            {isEnvGiven && (
              <input
                type="file"
                accept=".env"
                onChange={(e) => setEnvFile(e.target.files[0])}
              />
            )}
          </div>

          <div className="dashboard-input-group">
            <label title="Use this if your app has a backend (like Node.js, Flask)">
              <FaServer /> Backend Service?
            </label>
            <select
              value={isBackendService}
              onChange={(e) => setIsBackendService(e.target.value === "true")}
            >
              <option value="false">No (Public URL)</option>
              <option value="true">Yes (Docker Logs)</option>
            </select>
          </div>

          {/* 🔘 Button Row */}
          <div className="dashboard-button-row">
            <button
              type="submit"
              disabled={loading}
              className="dashboard-deploy-button"
            >
              {loading ? (
                <>
                  <FaRocket className="deploy-rocket-spin" /> Deploying...
                </>
              ) : (
                <>
                  <FaRocket /> Deploy Now
                </>
              )}
            </button>

            <button
              type="button"
              className="dashboard-schedule-button"
              onClick={() => setIsModalOpen(true)}
            >
              📅 Schedule for Later
            </button>
          </div>
        </form>
      </div>

      {isBackendService && (
        <div className="dashboard-logs-section">
          <h3>📝 Real-Time Logs (Backend Service)</h3>
          {!deploymentId && (
            <p className="dashboard-info-message">
              📢 Upon successful deployment, logs will appear below. Click{" "}
              <b>Refresh Logs</b> for updates.
            </p>
          )}

          {deploymentId && (
            <button
              className="dashboard-refresh-button"
              onClick={() => fetchDockerLogs(deploymentId)}
            >
              <FaSync /> Refresh Logs
            </button>
          )}

          <div className="dashboard-logs-container">
            {logs.map((log, index) => (
              <p key={index} className="dashboard-log-entry">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}

      {deploymentStatus && (
        <div className="dashboard-status-message">{deploymentStatus}</div>
      )}

      {/* 🧠 Modal for Schedule */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="dashboard-modal"
        overlayClassName="dashboard-overlay"
        ariaHideApp={false}
      >
        {/* ✖️ Close Button */}
        <button
          className="dashboard-modal-close"
          onClick={() => setIsModalOpen(false)}
        >
          &times;
        </button>
        <h2>📅 Schedule Deployment</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            <strong>Date:</strong>
          </label>
          <span className="picker-icon">📅</span>
          <ReactDatePicker
            selected={scheduleDate}
            onChange={(date) => setScheduleDate(date)}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            className="dashboard-datepicker"
            placeholderText="Select a date"
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            <strong>Time:</strong>
          </label>
          <span className="picker-icon">⏰</span>
          <ReactDatePicker
            selected={scheduleTime}
            onChange={(time) => setScheduleTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            dateFormat="h:mm aa"
            placeholderText="Select time"
            minTime={nowPlus30Min}
            maxTime={new Date().setHours(23, 59)}
            className="dashboard-datepicker"
          />
        </div>

        <div className="dashboard-modal-btn-wrapper">
          <button className="dashboard-deploy-button" onClick={handleSchedule}>
            <FaRocket /> Schedule
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
