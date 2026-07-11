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
import EmployeeSkillManagement from "../pages/EmployeeSkillManagement/EmployeeSkillManagement";
import Recommendation from "../pages/recommendation/Recommendation";
import OAuth2RedirectPage from "../pages/OAuth2Redirect/OAuth2Redirect";
import ProtectedRoute from "./ProtectedRoute";
import EmployeeGapAnalysis from "../pages/EmployeeGapAnalysis/EmployeeGapAnalysis";
import GapAnalysis from "../pages/GapAnalysis/GapAnalysis";
import EmployeeManagement from "../pages/EmployeeManagement/EmployeeManagement";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr", "manager", "team lead"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={["employee", "intern"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
  path="/employee-dashboard/gap-analysis"
  element={
    <ProtectedRoute allowedRoles={["Employee", "Intern"]}>
      <EmployeeGapAnalysis />
    </ProtectedRoute>
  }
/>
    <Route
    path="/dashboard/employees"
    element={
        <ProtectedRoute allowedRoles={["Admin"]}>
            <EmployeeManagement />
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
        path="/dashboard/role-skills"
        element={
          <ProtectedRoute>
            <RoleSkillMapping />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/roles"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <RoleManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/skills"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SkillManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/employee-skills"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <EmployeeSkillManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/recommendation"
        element={
          <ProtectedRoute>
            <Recommendation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/gap-analysis"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr", "manager", "team lead"]}>
            <GapAnalysis />
          </ProtectedRoute>
        }
      />

      <Route
        path="/oauth2/redirect"
        element={<OAuth2RedirectPage />}
      />
    </Routes>
  );
}

export default AppRoutes;