import React, { useState, useEffect } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import axios from "axios";
import "./PlanComparison.css";
import { FaCheck } from "react-icons/fa";
const API = process.env.REACT_APP_API_URL;

function PlanComparison() {
  const [isPaid, setIsPaid] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  // 🔎 Check if User is Already Subscribed
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      const token = sessionStorage.getItem("token");

      try {
        const res = await axios.get(
          `${API}/check-subscription`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // User has an active subscription
        if (res.data.plan) {
          setSubscriptionDetails(res.data);
          setIsPaid(true);
        }
      } catch (error) {
        console.warn("❌ No active subscription found.");
      }
    };

    checkSubscriptionStatus();
  }, []);

  // 🔥 Create PayPal Order
  const createOrder = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await axios.post(
        `${API}/create-order`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.data.order_id;
    } catch (error) {
      console.error("❌ Error creating PayPal order:", error);
      alert("❌ Failed to initiate payment.");
    }
  };

  // 🔥 Handle Payment Success
  const onApprove = async (data) => {
    try {
      const token = sessionStorage.getItem("token");

      await axios.post(
        `${API}/capture-payment/${data.orderID}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("🎉 Payment Successful! Subscription activated.");

      // Fetch subscription details
      const detailsRes = await axios.get(
        `${API}/subscription-details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubscriptionDetails(detailsRes.data);
      setIsPaid(true);
    } catch (error) {
      console.error("❌ Error capturing PayPal payment:", error);
      alert("❌ Payment verification failed. Please contact support.");
    }
  };

  // 🔥 Premium Features Section
  const PremiumFeatures = () => (
    <div className="premium-details">
      <h2>🎯 Premium Features Unlocked!</h2>

      <div className="plan-info">
        <p>
          <b>Plan:</b> {subscriptionDetails.plan}
        </p>
        <p>
          <b>Start Date:</b> {subscriptionDetails.start_date}
        </p>
        <p>
          <b>Expiry Date:</b> {subscriptionDetails.expiry_date}
        </p>
      </div>

      <h3>🌟 Available Features:</h3>
      <ul>
        {subscriptionDetails.features.map((feature, index) => (
          <li key={index} className="premium-feature-item">
            <span className="feature-icon">✅</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          "Ad5LSv9DiRpIXpAmrbcbKgSXv-MoWMz3ihE7B6u0iABDHn9IMQLCH705-JZCkuDXjEhIQNGbGS-3De1t",
      }}
    >
      <div className="plan-container">
        {isPaid && subscriptionDetails ? (
          <PremiumFeatures />
        ) : (
          <div className="plan-comparison">
            {/* Free Plan */}
            <div className="plan-card starter-plan">
              <h2>Freemium</h2>
              <p className="plan-price">Free</p>
              <button className="signup-button">Choose Plan</button>
            </div>

            {/* Premium Plan */}
            <div className="plan-card premium-plan">
              <h2>Premium</h2>
              <p className="plan-price">$50 / month</p>
              <ul>
                <li>
                  <FaCheck className="check-icon" /> Persistent Deployments
                </li>
                <li>
                  <FaCheck className="check-icon" /> Customized Public URLs
                </li>
                <li>
                  <FaCheck className="check-icon" /> .env Storage (AWS Secrets
                  Manager)
                </li>
                <li>
                  <FaCheck className="check-icon" /> Live Logs
                </li>
              </ul>

              {/* PayPal Button */}
              <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                onError={(err) => {
                  console.error("❌ Payment Error:", err);
                  alert("❌ Payment failed. Please try again.");
                }}
              />
            </div>
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  );
}

export default PlanComparison;
