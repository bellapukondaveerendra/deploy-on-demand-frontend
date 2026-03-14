import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainDashboard from "./pages/MainDashboard";
import Subscription from "./pages/Subscription";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/maindashboard" element={
          <PrivateRoute><MainDashboard /></PrivateRoute>
        } />
        <Route path="/subscription" element={
          <PrivateRoute><Subscription /></PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;