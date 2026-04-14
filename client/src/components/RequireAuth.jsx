import { Navigate } from "react-router-dom";

function getUser() {
  return JSON.parse(localStorage.getItem("vgp_user") || "null");
}

export default function RequireAuth({ children }) {
  if (!getUser()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
