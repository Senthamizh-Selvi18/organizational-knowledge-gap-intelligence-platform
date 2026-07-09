import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/Login/Login";
import RegisterPage from "../pages/Register/Register";
import ForgotPasswordPage from "../pages/ForgotPassword/ForgotPassword";
import ResetPasswordPage from "../pages/ResetPassword/ResetPassword";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import EmployeeDashboard from "../pages/EmployeeDashboard/EmployeeDashboard";
import Profile from "../pages/Profile/Profile";
import RoleManagement from "../pages/RoleManagement/RoleManagement";
import RoleSkillMapping from "../pages/RoleSkillMapping/RoleSkillMapping";
import SkillManagement from "../pages/SkillManagement/SkillManagement";
import ProtectedRoute from "./ProtectedRoute";
import OAuth2RedirectPage from "../pages/OAuth2Redirect/OAuth2Redirect";

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

      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/roles"
        element={
          <ProtectedRoute>
            <RoleManagement />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dashboard/role-skills"
        element={
          <ProtectedRoute>
            <RoleSkillMapping />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/skills"
        element={
          <ProtectedRoute>
            <SkillManagement />
          </ProtectedRoute>
        }
      />

      <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
    </Routes>
  );
}

export default AppRoutes;