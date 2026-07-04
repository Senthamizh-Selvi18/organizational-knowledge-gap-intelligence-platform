import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/Login/Login";
import RegisterPage from "../pages/Register/Register";
import ForgotPasswordPage from "../pages/ForgotPassword/ForgotPassword";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import EmployeeDashboard from "../pages/EmployeeDashboard/EmployeeDashboard";
import Profile from "../pages/Profile/Profile";
import RoleManagement from "../pages/RoleManagement/RoleManagement";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/dashboard"
        element={<DashboardPage />}
      />

      <Route path="/employee-dashboard" element={<EmployeeDashboard />} />

      <Route path="/dashboard/profile" element={<Profile />} />

      <Route path="/dashboard/roles" element={<RoleManagement />} />
    </Routes>
    
  );
}

export default AppRoutes;