import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { token, user } = useAuth();

  // 🚫 Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 User data missing (possible reload before auth context loads)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Role-based protection
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect user to their own dashboard if they try to access restricted routes
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "faculty":
        return <Navigate to="/faculty/dashboard" replace />;
      default:
        return <Navigate to="/student/dashboard" replace />;
    }
  }

  // ✅ Access granted
  return children;
}
