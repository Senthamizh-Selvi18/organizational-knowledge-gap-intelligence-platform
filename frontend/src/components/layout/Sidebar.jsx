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
  FiBookOpen,
  FiMessageCircle,
  FiX,
} from "react-icons/fi";

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  const role = localStorage.getItem("role")?.toLowerCase();

  console.log("Sidebar Role:", role);

  // Same menu items / role logic as before, just grouped into the
  // "Overview" / "Manage" sections from the reference layout.
const overviewItems = [
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
    label: "Course Catalog",
    icon: FiBookOpen,
    to: "/dashboard/course-catalog",
  },
  {
    label: "Chat",
    icon: FiMessageCircle,
    to: "/dashboard/chat",
  },
  {
    label: "Gap Analysis",
    icon: FiBarChart2,
    to:
      role === "employee" || role === "intern"
        ? "/employee-dashboard/gap-analysis"
        : "/dashboard/gap-analysis",
  },
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
];
  const manageItems = [
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

  const orgName = localStorage.getItem("orgName") || "KnowGap Workspace";

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-text/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`kg-side fixed inset-y-0 left-0 z-40 shadow-xl transition-transform duration-300 lg:translate-x-0 lg:static ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand — exact port of .brand from the reference file */}
        <div className="kg-brand">
          <div className="kg-mark" />
          <div>
            <b>KnowGap</b>
            <div className="kg-sub">Enterprise survey</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="ml-auto rounded-lg p-1.5 text-sub hover:bg-primary-tint hover:text-primary lg:hidden"
          >
            <FiX />
          </button>
        </div>

        <div className="kg-navlabel">Overview</div>
        <div className="kg-nav">
          {overviewItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onClose}
              className={({ isActive }) => (isActive ? "kg-active" : "")}
            >
              <Icon width="15" height="15" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="kg-navlabel">Manage</div>
        <div className="kg-nav">
          {manageItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onClose}
              className={({ isActive }) => (isActive ? "kg-active" : "")}
            >
              <Icon width="15" height="15" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="kg-side-foot">
          <div className="kg-av" />
          <span>{orgName}</span>
          <button onClick={handleLogout} aria-label="Logout" title="Logout">
            <FiLogOut size={15} />
          </button>
        </div>
      </aside>
    </>
  );
}