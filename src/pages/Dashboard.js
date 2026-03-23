import React, { useState } from "react";
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRocket, FaSync, FaServer, FaFileAlt, FaTimes, FaCalendarAlt } from "react-icons/fa";
import "./Dashboard.css";

const API = process.env.REACT_APP_API_URL;

export default function Dashboard() {
  const [repoUrl,         setRepoUrl]         = useState("");
  const [deploymentName,  setDeploymentName]  = useState("");
  const [branch,          setBranch]          = useState("main");
  const [deploymentId,    setDeploymentId]    = useState("");
  const [isEnvGiven,      setIsEnvGiven]      = useState(false);
  const [isBackend,       setIsBackend]       = useState(false);
  const [entryFile,       setEntryFile]       = useState("");
  const [envFile,         setEnvFile]         = useState(null);
  const [logs,            setLogs]            = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [deployStatus,    setDeployStatus]    = useState(null); // { type: 'success'|'error', msg }
  const [scheduleOpen,    setScheduleOpen]    = useState(false);
  const [scheduleDate,    setScheduleDate]    = useState(null);
  const [scheduleTime,    setScheduleTime]    = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const token = () => sessionStorage.getItem("token");
  const nowPlus30 = new Date(Date.now() + 30 * 60 * 1000);

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("repo_url",          repoUrl);
    fd.append("deployment_name",   deploymentName);
    fd.append("branch",            branch.trim() || "main");
    fd.append("is_backend_service",isBackend);
    fd.append("is_env_given",      isEnvGiven);
    fd.append("entry_file",        entryFile.trim());
    if (isEnvGiven && envFile) fd.append("env_file", envFile);
    return fd;
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setDeployStatus(null);
    try {
      const res = await axios.post(`${API}/deploy`, buildFormData(), {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setDeploymentId(res.data.deploy_id);
      if (isBackend) {
        setDeployStatus({ type: "success", msg: "✅ Deployment successful! Logs loading below." });
        fetchLogs(res.data.deploy_id);
      } else {
        setDeployStatus({
          type: "success",
          msg: `✅ Live at: ${res.data.public_url}`,
          url: res.data.public_url,
        });
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "Deployment failed.";
      setDeployStatus({ type: "error", msg: `❌ ${detail}` });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (id) => {
    try {
      const res = await axios.get(`${API}/docker-logs/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setLogs(res.data.logs || ["No logs available."]);
    } catch {
      setLogs(["Failed to fetch logs."]);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert("Please select both date and time.");
      return;
    }
    const dt = new Date(scheduleDate);
    dt.setHours(scheduleTime.getHours(), scheduleTime.getMinutes());
    if (dt < nowPlus30) {
      alert("Please pick a time at least 30 minutes from now.");
      return;
    }
    const fd = buildFormData();
    fd.append("scheduled_date", scheduleDate.toISOString().split("T")[0]);
    fd.append("scheduled_time", dt.toISOString());

    setScheduleLoading(true);
    try {
      await axios.post(`${API}/schedule`, fd, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      alert("✅ Deployment scheduled successfully!");
      setScheduleOpen(false);
      setScheduleDate(null);
      setScheduleTime(null);
    } catch (err) {
      alert(err.response?.data?.detail || "❌ Failed to schedule deployment.");
    } finally {
      setScheduleLoading(false);
    }
  };

  return (
    <div className="dd-root">
      {/* ── Header ── */}
      <div className="dd-header">
        <div>
          <h2 className="dd-heading">New Deployment</h2>
          <p className="dd-subheading">Clone, build and expose a GitHub repository</p>
        </div>
      </div>

      {/* ── Form ── */}
      <form className="dd-form" onSubmit={handleDeploy}>
        <div className="dd-field">
          <label>Deployment Name</label>
          <input
            type="text"
            value={deploymentName}
            onChange={e => setDeploymentName(e.target.value)}
            placeholder="my-app-v2"
            required
          />
        </div>

        <div className="dd-field">
          <label>GitHub Repository URL</label>
          <input
            type="text"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/user/repo"
            required
          />
        </div>

        <div className="dd-row">
          <div className="dd-field">
            <label>Branch</label>
            <input
              type="text"
              value={branch}
              onChange={e => setBranch(e.target.value)}
              placeholder="main"
            />
          </div>

          <div className="dd-field">
            <label><FaServer /> Project type</label>
            <select value={isBackend} onChange={e => setIsBackend(e.target.value === "true")}>
              <option value="false">Static / Frontend (Public URL)</option>
              <option value="true">Backend Service (Docker Logs)</option>
            </select>
          </div>
        </div>

        {/* Entry file — only relevant for backend services */}
        {isBackend && (
          <div className="dd-field">
            <label>
              Entry File
              <span className="dd-label-hint"> — e.g. app.py, server.py, index.js (leave blank to auto-detect)</span>
            </label>
            <input
              type="text"
              value={entryFile}
              onChange={e => setEntryFile(e.target.value)}
              placeholder="app.py"
            />
          </div>
        )}

        <div className="dd-field">
          <label><FaFileAlt /> .env file?</label>
          <select value={isEnvGiven} onChange={e => setIsEnvGiven(e.target.value === "true")}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        {isEnvGiven && (
          <div className="dd-field">
            <label>Upload .env file</label>
            <input type="file" accept=".env" onChange={e => setEnvFile(e.target.files[0])} />
          </div>
        )}

        <div className="dd-actions">
          <button type="submit" className="btn-primary dd-btn" disabled={loading}>
            <FaRocket className={loading ? "spin" : ""} />
            {loading ? "Deploying…" : "Deploy Now"}
          </button>
          <button
            type="button"
            className="btn-ghost dd-btn"
            onClick={() => setScheduleOpen(true)}
          >
            <FaCalendarAlt /> Schedule for Later
          </button>
        </div>
      </form>

      {/* ── Status ── */}
      {deployStatus && (
        <div className={`dd-status ${deployStatus.type}`}>
          <div className="dd-status-msg">
            {deployStatus.type === "error"
              ? <pre className="dd-error-pre">{deployStatus.msg}</pre>
              : <span>{deployStatus.msg}</span>
            }
          </div>
          {deployStatus.url && (
            <a href={deployStatus.url} target="_blank" rel="noopener noreferrer">
              Open ↗
            </a>
          )}
        </div>
      )}

      {/* ── Logs ── */}
      {isBackend && (
        <div className="dd-logs-section">
          <div className="dd-logs-header">
            <span>Docker Logs</span>
            {deploymentId && (
              <button className="btn-ghost dd-refresh" onClick={() => fetchLogs(deploymentId)}>
                <FaSync /> Refresh
              </button>
            )}
          </div>
          <div className="dd-logs">
            {deploymentId
              ? logs.map((l, i) => <div key={i} className="dd-log-line">{l}</div>)
              : <div className="dd-logs-placeholder">Logs will appear here after a successful deployment.</div>
            }
          </div>
        </div>
      )}

      {/* ── Schedule Modal ── */}
      {scheduleOpen && (
        <>
          <div className="dd-overlay" onClick={() => setScheduleOpen(false)} />
          <div className="dd-modal">
            <button className="dd-modal-close" onClick={() => setScheduleOpen(false)}>
              <FaTimes />
            </button>
            <h3 className="dd-modal-title">Schedule Deployment</h3>
            <p className="dd-modal-sub">Pick a date and time — minimum 30 minutes from now</p>

            <div className="dd-modal-fields">
              <div className="dd-field">
                <label>Date</label>
                <ReactDatePicker
                  selected={scheduleDate}
                  onChange={setScheduleDate}
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                  placeholderText="Select date"
                  className="dd-datepicker"
                />
              </div>
              <div className="dd-field">
                <label>Time</label>
                <ReactDatePicker
                  selected={scheduleTime}
                  onChange={setScheduleTime}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  dateFormat="h:mm aa"
                  minTime={nowPlus30}
                  maxTime={new Date(new Date().setHours(23, 59))}
                  placeholderText="Select time"
                  className="dd-datepicker"
                />
              </div>
            </div>

            <button
              className="btn-primary dd-btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleSchedule}
              disabled={scheduleLoading}
            >
              <FaCalendarAlt />
              {scheduleLoading ? "Scheduling…" : "Confirm Schedule"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}