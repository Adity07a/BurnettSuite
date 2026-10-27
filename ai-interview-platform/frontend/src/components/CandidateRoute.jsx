import React from "react";
import { Navigate } from "react-router-dom";

export default function CandidateRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.is_staff) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
}