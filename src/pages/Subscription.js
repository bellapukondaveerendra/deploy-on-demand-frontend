import React, { useState, useEffect } from "react";
import axios from "axios";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import "./Subscription.css";

function SubscriptionPage() {
  const [isPaid, setIsPaid] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [price, setPrice] = useState("35"); // Default to Monthly

  // 🔥 Create PayPal Order
  const createOrder = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:9000/create-order",
        { price }, // Dynamic price for Monthly or Yearly
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
        `http://localhost:9000/capture-payment/${data.orderID}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("🎉 Payment Successful! Subscription activated.");

      // Fetch subscription details
      const detailsRes = await axios.get(
        "http://localhost:9000/check-subscription",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubscriptionDetails(detailsRes.data);
      setIsPaid(true);
    } catch (error) {
      console.error("❌ Error capturing PayPal payment:", error);
      alert("❌ Payment verification failed. Please contact support.");
    }
  };

  // 🔥 Features Section
  const FeaturesSection = () => (
    <div className="features-section">
      <h2>✨ Premium Features Included</h2>
      <div className="features-list">
        <div className="feature-card">🎥 Video Solutions</div>
        <div className="feature-card">📚 Access to Premium Content</div>
        <div className="feature-card">🏢 Select Questions by Company</div>
        <div className="feature-card">🛠️ Debugger</div>
        <div className="feature-card">📊 Sort Questions by Prevalence</div>
        <div className="feature-card">⚡ Lightning Judge</div>
        <div className="feature-card">🤖 Autocomplete</div>
        <div className="feature-card">🧑‍💻 Interview Simulations</div>
      </div>
    </div>
  );

  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          "Ad5LSv9DiRpIXpAmrbcbKgSXv-MoWMz3ihE7B6u0iABDHn9IMQLCH705-JZCkuDXjEhIQNGbGS-3De1t",
      }}
    >
      <div className="subscription-container">
        <h1 className="subscription-title">Premium</h1>
        <p className="subscription-subtitle">
          Get started with a plan that works for you.
        </p>

        {isPaid && subscriptionDetails ? (
          <div className="premium-details">
            <h2>🎯 Premium Features Unlocked!</h2>
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
        ) : (
          <div className="plans-container">
            {/* Monthly Plan */}
            <div className="plan-card monthly">
              <h3>Monthly</h3>
              <p className="billing-cycle">Billed monthly</p>
              <p className="price-discount">Down from $39/month.</p>
              <h2 className="price">
                $25 <span>/mo</span>
              </h2>

              <PayPalButtons
                createOrder={async () => {
                  setPrice("25"); // Set Monthly Price
                  return await createOrder();
                }}
                onApprove={onApprove}
                onError={(err) => {
                  console.error("❌ Payment Error:", err);
                  alert("❌ Payment failed. Please try again.");
                }}
              />
            </div>

            {/* Yearly Plan */}
            <div className="plan-card yearly">
              <div className="most-popular">🎉 Most Popular</div>
              <h3>Yearly</h3>
              <p className="billing-cycle">Billed yearly ($159)</p>
              <p className="price-discount">Down from $299/year.</p>
              <h2 className="price">
                $13.25 <span>/mo</span>
              </h2>

              <PayPalButtons
                createOrder={async () => {
                  setPrice("13.25"); // Set Yearly Price
                  return await createOrder();
                }}
                onApprove={onApprove}
                onError={(err) => {
                  console.error("❌ Payment Error:", err);
                  alert("❌ Payment failed. Please try again.");
                }}
              />
            </div>
          </div>
        )}

        {/* Features Section */}
        <FeaturesSection />
      </div>
    </PayPalScriptProvider>
  );
}

export default SubscriptionPage;
