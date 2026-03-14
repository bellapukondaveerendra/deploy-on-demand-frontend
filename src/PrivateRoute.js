import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;