import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  FiSearch,
  FiBell,
  FiMoon,
  FiSun,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiMessageCircle,
} from "react-icons/fi"
import { getUnreadCount } from "../../services/chatservice"
import { getUnreadCount as getUnreadNotifCount } from "../../services/notificationService"

const CRUMBS = [
  { match: /^\/dashboard\/profile/, title: "Profile", sub: "your account" },
  { match: /^\/dashboard\/skills/, title: "Skills", sub: "skill catalogue" },
  { match: /^\/dashboard\/employee-skills/, title: "Employee Skills", sub: "team coverage" },
  { match: /^\/dashboard\/gap-analysis/, title: "Gap Analysis", sub: "coverage vs. target" },
  { match: /^\/dashboard\/recommendation/, title: "AI Recommendation", sub: "suggested learning" },
  { match: /^\/dashboard\/employees/, title: "Employees", sub: "people directory" },
  { match: /^\/dashboard\/roles/, title: "Role Management", sub: "access & permissions" },
  { match: /^\/dashboard\/competencies/, title: "Competencies", sub: "role skill mapping" },
  { match: /^\/dashboard\/notifications/, title: "Notifications", sub: "recent activity" },
  { match: /^\/dashboard\/chat/, title: "Messages", sub: "team conversations" },
  { match: /^\/dashboard\/settings/, title: "Settings", sub: "preferences" },
  { match: /^\/employee-dashboard/, title: "Dashboard", sub: "your overview" },
  { match: /^\/dashboard/, title: "Dashboard", sub: "organizational overview" },
]

function useCrumb() {
  const { pathname } = useLocation()
  const found = CRUMBS.find((c) => c.match.test(pathname))
  return found || { title: "KnowGap", sub: "" }
}

export default function Navbar({ onMenuClick }) {
const [darkMode, setDarkMode] = useState(() => {
  const storedTheme = localStorage.getItem("theme");
  return storedTheme
    ? storedTheme === "dark"
    : document.documentElement.classList.contains("dark");
});

useEffect(() => {
  document.documentElement.classList.toggle("dark", darkMode);
  localStorage.setItem("theme", darkMode ? "dark" : "light");
}, [darkMode]);

useEffect(() => {
  const syncFromStorage = () => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  };
  window.addEventListener("themechange", syncFromStorage);
  return () => window.removeEventListener("themechange", syncFromStorage);
}, []);
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const crumb = useCrumb()

  const userName = localStorage.getItem("name") || "User";
const role = localStorage.getItem("role") || "";

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchUnreadNotifs = async () => {
      try {
        const count = await getUnreadNotifCount();
        if (!cancelled) setUnreadNotifCount(count);
      } catch (e) {
        // silent — bell badge shouldn't break the navbar
      }
    };

    fetchUnreadNotifs();
    const id = setInterval(fetchUnreadNotifs, 6000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    const fetchUnread = async () => {
      try {
        const count = await getUnreadCount();
        if (!cancelled) setUnreadCount(count);
      } catch (e) {
        // silent — chat badge shouldn't break the navbar
      }
    };

    fetchUnread();
    const id = setInterval(fetchUnread, 6000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [location.pathname]);

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
    <div className="px-4 pt-5 sm:px-8">
      <div className="kg-topbar">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="kg-iconbtn lg:hidden"
          >
            <FiMenu className="h-4 w-4" />
          </button>
          <div className="kg-crumb">
            {crumb.title}
            {crumb.sub && <span>/ {crumb.sub}</span>}
          </div>
        </div>

        <div className="kg-tools">
          <label className="kg-search hidden md:flex">
            <FiSearch width="13" height="13" />
            <input type="search" placeholder="Search skills, employees, competencies…" />
          </label>

          <button
            type="button"
            onClick={() => navigate("/dashboard/chat")}
            aria-label="Messages"
            title="Messages"
            className="kg-iconbtn kg-bell relative"
          >
            <FiMessageCircle width="15" height="15" />
            {unreadCount > 0 && (
              <span className="pulse-dot absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rust px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/notifications")}
            aria-label="Notifications"
            title="Notifications"
            className="kg-iconbtn kg-bell relative"
          >
            <FiBell width="15" height="15" />
            {unreadNotifCount > 0 && (
              <span className="pulse-dot absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rust px-1 text-[10px] font-bold text-white">
                {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle light / dark"
            title="Toggle light / dark"
            aria-pressed={darkMode}
            className="kg-iconbtn kg-themebtn"
          >
            {darkMode ? (
              <FiSun width="16" height="16" style={{ transform: "rotate(40deg)" }} />
            ) : (
              <FiMoon width="16" height="16" />
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="kg-profile"
            >
              <div className="kg-av">{userName.charAt(0).toUpperCase()}</div>
              <div className="hidden text-left sm:block">
                <b>{userName}</b>
                <span>{role}</span>
              </div>
              <FiChevronDown
                className={`hidden h-3.5 w-3.5 text-mute transition-transform duration-200 sm:block ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              role="menu"
              className={`absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl backdrop-blur-xl transition-all duration-200 ${
                menuOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
              }`}
            >
              <div className="border-b border-line px-4 py-3">
                <p className="text-sm font-semibold text-text">{userName}</p>
                <p className="text-xs text-sub">{role}</p>
              </div>
              <div className="p-1.5">
                <Link
                  to="/dashboard/profile"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sub transition-colors hover:bg-primary-tint hover:text-primary"
                >
                  <FiUser className="h-4.5 w-4.5" />
                  My Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sub transition-colors hover:bg-primary-tint hover:text-primary"
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
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sub transition-colors hover:bg-rust-tint hover:text-rust"
                >
                  <FiLogOut className="h-4.5 w-4.5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}