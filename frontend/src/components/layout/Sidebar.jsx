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
  FiMessageCircle,
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

    {
      label: "Chat",
      icon: FiMessageCircle,
      to: "/dashboard/chat",
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
        className={`fixed inset-0 z-30 bg-text/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col
border-r border-line
bg-panel
shadow-xl
transition-transform duration-300
lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <div className="flex items-center gap-2.5">
            <div className="relative h-[30px] w-[30px] flex-none rounded-[9px] bg-gradient-to-br from-grad1 to-grad2">
              <div
                className="absolute inset-0 rounded-[9px]"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, rgba(255,255,255,.5), transparent 60%)",
                }}
              />
            </div>
            <div>
              <p className="font-serif text-[19px] font-bold leading-none tracking-tight text-text">
                KnowGap
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[.08em] text-mute">
                Skill Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-sub hover:bg-primary-tint hover:text-primary lg:hidden"
          >
            <FiX />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 font-mono text-[9.5px] font-medium uppercase tracking-[.1em] text-mute">
            Menu
          </p>
          <ul className="space-y-1">
            {menuItems.map(({ label, icon: Icon, to }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    isActive
                      ? "active flex items-center gap-3 rounded-lg bg-primary-tint px-3 py-2.5 text-sm font-semibold text-primary"
                      : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sub transition-colors hover:bg-primary-tint hover:text-primary"
                  }
                >
                  <Icon className="h-[17px] w-[17px] flex-none opacity-80" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sub transition-colors hover:bg-rust-tint hover:text-rust"
          >
            <FiLogOut className="h-[17px] w-[17px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}