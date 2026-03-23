import React, { useState, useEffect } from "react";
import axios from "axios";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { FaCheck, FaRocket, FaStar } from "react-icons/fa";
import "./Subscription.css";

const API = process.env.REACT_APP_API_URL;
const PAYPAL_CLIENT_ID = "Ad5LSv9DiRpIXpAmrbcbKgSXv-MoWMz3ihE7B6u0iABDHn9IMQLCH705-JZCkuDXjEhIQNGbGS-3De1t";

const FREE_FEATURES = [
  "3 active deployments",
  "Flask, Node.js, Static HTML support",
  "ngrok public URLs",
  "Scheduled deployments",
  "Docker log viewer",
];

const PRO_FEATURES = [
  "Unlimited deployments",
  "Persistent deployments",
  "Custom subdomain support",
  ".env secret storage (encrypted)",
  "Live log streaming",
  "Priority support",
];

export default function Subscription() {
  const [subDetails,  setSubDetails]  = useState(null);
  const [subLoading,  setSubLoading]  = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  const token = () => sessionStorage.getItem("token");

  useEffect(() => {
    const checkSub = async () => {
      try {
        const res = await axios.get(`${API}/check-subscription`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        setSubDetails(res.data);
      } catch {
        // 404 = no active subscription — that's fine
      } finally {
        setSubLoading(false);
      }
    };
    checkSub();
  }, []);

  const createOrder = async () => {
    const price = selectedPlan === "monthly" ? "25" : "159";
    try {
      const res = await axios.post(
        `${API}/create-order`,
        { price },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      return res.data.order_id;
    } catch (err) {
      alert("Failed to initiate payment.");
      throw err;
    }
  };

  const onApprove = async (data) => {
    try {
      await axios.post(
        `${API}/capture-payment/${data.orderID}`,
        {},
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      const res = await axios.get(`${API}/check-subscription`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setSubDetails(res.data);
      alert("🎉 Payment successful! Premium activated.");
    } catch {
      alert("Payment verification failed. Please contact support.");
    }
  };

  if (subLoading) return <div className="sub-loading">Loading subscription details…</div>;

  if (subDetails?.is_active) {
    return (
      <div className="sub-active">
        <div className="sub-active-badge"><FaStar /> Premium</div>
        <h2 className="sub-active-title">Your Premium Plan</h2>
        <div className="sub-active-details">
          <div className="sub-detail-row"><span>Plan</span><span>{subDetails.plan}</span></div>
          <div className="sub-detail-row"><span>Started</span><span>{subDetails.start_date}</span></div>
          <div className="sub-detail-row"><span>Renews</span><span>{subDetails.expiry_date}</span></div>
        </div>
        <div className="sub-active-features">
          <p className="sub-features-label">What's included</p>
          {PRO_FEATURES.map(f => (
            <div key={f} className="sub-feature-row">
              <FaCheck style={{ color: "var(--green)", flexShrink: 0 }} />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>
      <div className="sub-root">
        <div className="sub-header">
          <h2 className="sub-title">Upgrade to Premium</h2>
          <p className="sub-subtitle">Unlock unlimited deployments and advanced features</p>
        </div>

        <div className="sub-plan-toggle">
          <button
            className={`sub-toggle-btn ${selectedPlan === "monthly" ? "active" : ""}`}
            onClick={() => setSelectedPlan("monthly")}
          >
            Monthly
          </button>
          <button
            className={`sub-toggle-btn ${selectedPlan === "yearly" ? "active" : ""}`}
            onClick={() => setSelectedPlan("yearly")}
          >
            Yearly <span className="sub-save-tag">Save 47%</span>
          </button>
        </div>

        <div className="sub-cards">
          {/* Free */}
          <div className="sub-card free">
            <div className="sub-card-header">
              <div className="sub-card-name">Free</div>
              <div className="sub-card-price">$0<span>/mo</span></div>
            </div>
            <div className="sub-card-features">
              {FREE_FEATURES.map(f => (
                <div key={f} className="sub-feature-row">
                  <FaCheck style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="sub-card-cta">
              <button className="btn-ghost" style={{ width: "100%", justifyContent: "center" }} disabled>
                Current Plan
              </button>
            </div>
          </div>

          {/* Premium */}
          <div className="sub-card premium">
            <div className="sub-card-badge"><FaRocket /> Most Popular</div>
            <div className="sub-card-header">
              <div className="sub-card-name">Premium</div>
              <div className="sub-card-price">
                {selectedPlan === "monthly" ? "$25" : "$13.25"}
                <span>/mo</span>
              </div>
              {selectedPlan === "yearly" && (
                <div className="sub-card-billed">Billed $159/year</div>
              )}
            </div>
            <div className="sub-card-features">
              {PRO_FEATURES.map(f => (
                <div key={f} className="sub-feature-row">
                  <FaCheck style={{ color: "var(--green)", flexShrink: 0 }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="sub-card-cta">
              <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                onError={() => alert("Payment failed. Please try again.")}
                style={{ layout: "vertical", shape: "rect", color: "gold", label: "pay" }}
              />
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}