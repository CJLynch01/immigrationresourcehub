import { Navigate } from "react-router-dom";

/**
 * Wraps a route and redirects to /login if the user is not authenticated.
 * Pass requiredRole="admin" to also enforce role-based access.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Logged in but wrong role — send to their own dashboard
    return <Navigate to={user.role === "admin" ? "/admin" : "/client"} replace />;
  }

  return children;
}