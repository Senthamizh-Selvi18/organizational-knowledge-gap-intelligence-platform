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
import GapAnalysis from "../pages/GapAnalysis/GapAnalysis";
import CourseCatalog from "../pages/CourseCatalog/CourseCatalog";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr", "manager", "team lead"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Employee Dashboard */}
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={["employee", "intern"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Role Skill Mapping */}
      <Route
        path="/dashboard/role-skills"
        element={
          <ProtectedRoute>
            <RoleSkillMapping />
          </ProtectedRoute>
        }
      />

      {/* Role Management */}
      <Route
        path="/dashboard/roles"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <RoleManagement />
          </ProtectedRoute>
        }
      />

      {/* Skill Management */}
      <Route
        path="/dashboard/skills"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SkillManagement />
          </ProtectedRoute>
        }
      />

      {/* Employee Skill Management */}
      <Route
        path="/dashboard/employee-skills"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <EmployeeSkillManagement />
          </ProtectedRoute>
        }
      />

      {/* AI Recommendation */}
      <Route
        path="/dashboard/recommendation"
        element={
          <ProtectedRoute>
            <Recommendation />
          </ProtectedRoute>
        }
      />

      {/* Gap Analysis */}
      <Route
        path="/dashboard/gap-analysis"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr", "manager", "team lead"]}>
            <GapAnalysis />
          </ProtectedRoute>
        }
      />

      {/* Course Catalog */}
      <Route
        path="/dashboard/course-catalog"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr", "manager", "employee"]}>
            <CourseCatalog />
          </ProtectedRoute>
        }
      />

      {/* OAuth */}
      <Route
        path="/oauth2/redirect"
        element={<OAuth2RedirectPage />}
      />
    </Routes>
  );
}

export default AppRoutes;