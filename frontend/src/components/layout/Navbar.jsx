import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiMessageSquare,
  FiMoon,
  FiSun,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
} from "react-icons/fi"

export default function Navbar({ onMenuClick }) {
 const [darkMode, setDarkMode] = useState(
  document.documentElement.classList.contains("dark")
);

useEffect(() => {
  document.documentElement.classList.toggle("dark", darkMode);
}, [darkMode]);
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
   <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 backdrop-blur-xl dark:bg-slate-900 dark:border-slate-700">
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <FiMenu className="h-5 w-5" />
        </button>

        {/* Project name (hidden on small) */}
        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <span className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-white">
            Organizational Knowledge Gap Intelligence Platform
          </span>
        </div>

        {/* Search */}
        <div className="relative ml-auto w-full max-w-xs md:ml-6 md:mr-auto md:max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search skills, employees, competencies…"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/15"
          />
        </div>

        {/* Action icons */}
        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <FiBell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <button
            type="button"
            aria-label="Messages"
            className="relative hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 sm:flex"
          >
            <FiMessageSquare className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
              3
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle dark mode"
            aria-pressed={darkMode}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
          >
            {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
          </button>

          <span className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-slate-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm">
                S
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-semibol text-slate-800 dark:text-white">
                  Sneha
                </span>
                <span className="block text-xs text-slate-500">Employee</span>
              </span>
              <FiChevronDown
                className={`hidden h-4 w-4 text-slate-400 transition-transform duration-200 sm:block ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu */}
            <div
              role="menu"
              className={`absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-white/60 bg-white dark:bg-slate-800/80 shadow-2xl shadow-blue-900/10 backdrop-blur-xl transition-all duration-200 ${
                menuOpen
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0"
              }`}
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Sneha</p>
                <p className="text-xs text-slate-500">Employee</p>
              </div>
              <div className="p-1.5">
                <Link
                  to="/dashboard/profile"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  <FiUser className="h-4.5 w-4.5" />
                  My Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  <FiSettings className="h-4.5 w-4.5" />
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate("/login")
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <FiLogOut className="h-4.5 w-4.5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
