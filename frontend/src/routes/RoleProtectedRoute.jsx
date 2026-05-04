import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

export default function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}