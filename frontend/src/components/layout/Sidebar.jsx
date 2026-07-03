import { NavLink, useNavigate } from "react-router-dom"
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
} from "react-icons/fi"

const menuItems = [
  { label: "Dashboard", icon: FiHome, to: "/employee-dashboard" },
  { label: "Profile", icon: FiUser, to: "/dashboard/profile" },
  { label: "Skills", icon: FiCpu, to: "/dashboard/skills" },
  { label: "Competencies", icon: FiBarChart2, to: "/dashboard/competencies" },
  { label: "Employees", icon: FiUsers, to: "/dashboard/employees" },
  { label: "Role Management", icon: FiShield, to: "/dashboard/roles" },
  { label: "Notifications", icon: FiBell, to: "/dashboard/notifications" },
  { label: "Settings", icon: FiSettings, to: "/dashboard/settings" },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-white/60 bg-white/70 shadow-xl shadow-blue-900/5 backdrop-blur-xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between gap-3 border-b border-white/60 px-5">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Company logo"
              className="h-10 w-10 rounded-xl bg-white/70 p-1 shadow-sm ring-1 ring-white/60"
            />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-slate-900">
                KnowGap
              </p>
              <p className="text-[11px] font-medium tracking-wide text-blue-700/70 uppercase">
                Intelligence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>
          <ul className="flex flex-col gap-1">
            {menuItems.map(({ label, icon: Icon, to }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  end={to === "/dashboard"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "text-slate-600 hover:translate-x-0.5 hover:bg-blue-50 hover:text-blue-700"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                        }`}
                      />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="flex-shrink-0 border-t border-white/60 p-3">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
          >
            <FiLogOut className="h-5 w-5 flex-shrink-0 text-slate-400 transition-colors group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
