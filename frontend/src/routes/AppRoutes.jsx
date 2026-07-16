import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/Login";
import RegisterPage from "../pages/Register/Register";
import ForgotPasswordPage from "../pages/ForgotPassword/ForgotPassword";
import ResetPasswordPage from "../pages/ResetPassword/ResetPassword";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import EmployeeDashboard from "../pages/EmployeeDashboard/EmployeeDashboard";
import EmployeeGapAnalysis from "../pages/EmployeeGapAnalysis/EmployeeGapAnalysis";
import Profile from "../pages/Profile/Profile";
import RoleManagement from "../pages/RoleManagement/RoleManagement";
import RoleSkillMapping from "../pages/RoleSkillMapping/RoleSkillMapping";
import RoleSkillRequirements from "../pages/RoleSkillRequirements/RoleSkillRequirements";
import SkillManagement from "../pages/SkillManagement/SkillManagement";
import EmployeeSkillManagement from "../pages/EmployeeSkillManagement/EmployeeSkillManagement";
import EmployeeManagement from "../pages/EmployeeManagement/EmployeeManagement";
import Recommendation from "../pages/recommendation/Recommendation";
import OAuth2RedirectPage from "../pages/OAuth2Redirect/OAuth2Redirect";
import ProtectedRoute from "./ProtectedRoute";
import GapAnalysis from "../pages/GapAnalysis/GapAnalysis";
import CompetencyFramework from "../pages/CompetencyFramework/CompetencyFramework";
import CourseCatalog from "../pages/CourseCatalog/CourseCatalog";
import ChatBox from "../pages/Chat/ChatBox";
import DashboardLayout from "../components/layout/DashboardLayout";
import Settings from "../pages/Settings/Settings";
import ExternalCourseManagement from "../pages/ExternalCourseManagement/ExternalCourseManagement";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin Dashboard */}
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

      {/* Employee Gap Analysis */}
      <Route
        path="/employee-dashboard/gap-analysis"
        element={
          <ProtectedRoute allowedRoles={["employee", "intern"]}>
            <EmployeeGapAnalysis />
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

      {/* Chat */}
      <Route
        path="/dashboard/chat"
        element={
          <ProtectedRoute>
            <ChatBox />
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

      {/* Required Skill Levels (Risk Badges) */}
      <Route
        path="/dashboard/role-skill-requirements"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <RoleSkillRequirements />
          </ProtectedRoute>
        }
      />

      {/* Employee Management */}
      <Route
        path="/dashboard/employees"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <EmployeeManagement />
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

      {/* Admin Gap Analysis */}
      <Route
        path="/dashboard/gap-analysis"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr", "manager", "team lead"]}>
            <GapAnalysis />
          </ProtectedRoute>
        }
      />

<<<<<<< HEAD
      {/* Competency Framework */}
      <Route
        path="/dashboard/competencies"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CompetencyFramework />
=======
      {/* Course Catalog */}
      <Route
        path="/dashboard/course-catalog"
        element={
          <ProtectedRoute
            allowedRoles={["employee", "intern"]}
          >
            <CourseCatalog />
>>>>>>> a6683df16dc71599705cbbdd1a3ea21d4a747fc8
          </ProtectedRoute>
        }
      />

      {/* External Course Management (Admin) */}
      <Route
        path="/dashboard/external-courses"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ExternalCourseManagement />
          </ProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* OAuth2 Redirect */}
      <Route
        path="/oauth2/redirect"
        element={<OAuth2RedirectPage />}
      />
    </Routes>
  );
}

export default AppRoutes;