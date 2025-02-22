import React, { useState } from "react";
import axios from "axios";

function Dashboard() {
  const [repoUrl, setRepoUrl] = useState("");
  const [deployStatus, setDeployStatus] = useState("");
  const [publicUrl, setPublicUrl] = useState(""); // ✅ Store public URL

  const handleDeploy = async () => {
    setDeployStatus("🚀 Deploying...");
    setPublicUrl(""); // Reset previous URL

    try {
      const response = await axios.post("http://127.0.0.1:8000/deploy", {
        repo_url: repoUrl,
      });

      if (response.data.deploy_id && response.data.public_url) {
        setDeployStatus(`✅ Deployed! ID: ${response.data.deploy_id}`);
        setPublicUrl(response.data.public_url); // ✅ Store public URL
      } else {
        setDeployStatus("❌ Deployment failed: No URL returned.");
      }
    } catch (error) {
      console.error("Error:", error);
      setDeployStatus(
        "❌ Deployment failed: " +
          (error.response?.data?.detail || "Unknown error")
      );
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Deploy Your App</h1>
      <p>Enter your GitHub repository URL to deploy:</p>
      <input
        type="text"
        placeholder="https://github.com/user/repository"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        style={{ padding: "10px", width: "300px", fontSize: "16px" }}
      />
      <br />
      <br />
      <button
        onClick={handleDeploy}
        style={{ padding: "10px 20px", fontSize: "18px" }}
      >
        Deploy
      </button>

      <p>{deployStatus}</p>

      {publicUrl && (
        <p>
          🔗{" "}
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            View Deployed App
          </a>
        </p>
      )}
    </div>
  );
}

export default Dashboard;
