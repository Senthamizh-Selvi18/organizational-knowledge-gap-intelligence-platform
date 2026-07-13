import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUser,
  FiCpu,
  FiBarChart2,
  FiUsers,
  FiShield,
  FiBell,
  FiSettings,
  FiLogOut,
  FiX,
} from "react-icons/fi";

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  const role = localStorage.getItem("role")?.toLowerCase();

  console.log("Sidebar Role:", role);

  const menuItems = [
    {
      label: "Dashboard",
      icon: FiHome,
      to:
        role === "employee" || role === "intern"
          ? "/employee-dashboard"
          : "/dashboard",
    },

    {
      label: "Profile",
      icon: FiUser,
      to: "/dashboard/profile",
    },

    ...(role === "admin"
      ? [
          {
            label: "Skills",
            icon: FiCpu,
            to: "/dashboard/skills",
          },
        ]
      : []),
    ...(role === "admin" || role === "hr"
      ? [
          {
            label: "Employee Skills",
            icon: FiCpu,
            to: "/dashboard/employee-skills",
          },
        ]
      : []),
       ...(role === "admin" || role === "hr"
        ?[
    {
      label: "Gap Analysis",
      icon: FiBarChart2,
      to: "/dashboard/gap-analysis",
    },
  ]
  :
  []),
    {
      label: "AI Recommendation",
      icon: FiCpu,
      to: "/dashboard/recommendation",
    },

    {
      label: "Competencies",
      icon: FiBarChart2,
      to: "/dashboard/competencies",
    },

    ...(role === "admin" || role === "hr"
      ? [
          {
            label: "Employees",
            icon: FiUsers,
            to: "/dashboard/employees",
          },
        ]
      : []),

    ...(role === "admin"
      ? [
          {
            label: "Role Management",
            icon: FiShield,
            to: "/dashboard/roles",
          },
        ]
      : []),

    {
      label: "Notifications",
      icon: FiBell,
      to: "/dashboard/notifications",
    },

    {
      label: "Settings",
      icon: FiSettings,
      to: "/dashboard/settings",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col
border-r border-slate-200
bg-white
dark:bg-slate-900
dark:border-slate-700
shadow-xl
transition-transform duration-300
lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="logo"
              className="h-8 w-8 rounded-lg"
            />

            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                KnowGap
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-700 dark:text-white"
          >
            <FiX />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-1">
            {menuItems.map(({ label, icon: Icon, to }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-3 rounded-xl bg-blue-600 text-white px-3 py-2"
                      : "flex items-center gap-3 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800"
                  }
                >
                  <Icon />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t p-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-700 dark:text-white"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}