import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.map(r => r.toLowerCase()).includes(role)
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
}