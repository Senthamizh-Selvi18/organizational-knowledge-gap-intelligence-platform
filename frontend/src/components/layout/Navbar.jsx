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
import { getUnreadCount, getConversationSummaries } from "../../services/chatService"

export default function Navbar({ onMenuClick }) {
 const [darkMode, setDarkMode] = useState(
  document.documentElement.classList.contains("dark")
);

useEffect(() => {
  document.documentElement.classList.toggle("dark", darkMode);
}, [darkMode]);
  const [menuOpen, setMenuOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [conversations, setConversations] = useState([])
  const dropdownRef = useRef(null)
  const messagesRef = useRef(null)
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const toggleNotifications = async (e) => {
    e.stopPropagation();
    const opening = !notifOpen;
    setNotifOpen(opening);
    setMessagesOpen(false);
    setMenuOpen(false);
    if (opening) {
      try {
        const data = await getConversationSummaries();
        setConversations(data);
      } catch (err) {
        setConversations([]);
      }
    }
  };

  const userName = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role") || "";

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
      if (messagesRef.current && !messagesRef.current.contains(e.target)) {
        setMessagesOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    let cancelled = false;

    const fetchUnread = async () => {
      try {
        const count = await getUnreadCount();
        if (!cancelled) setUnreadCount(count);
      } catch (err) {
        // ignore if not logged in yet
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const toggleMessages = async (e) => {
    e.stopPropagation();
    const opening = !messagesOpen;
    setMessagesOpen(opening);
    setMenuOpen(false);
    setNotifOpen(false);
    if (opening) {
      try {
        const data = await getConversationSummaries();
        setConversations(data);
      } catch (err) {
        setConversations([]);
      }
    }
  };

  const openConversation = (contactId) => {
    setMessagesOpen(false);
    navigate(`/dashboard/chat?with=${contactId}`);
  };

  return (
   <header className="sticky top-0 z-20 border-b border-line bg-panel/90 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sub transition-colors hover:bg-primary-tint hover:text-primary lg:hidden"
        >
          <FiMenu className="h-5 w-5" />
        </button>

        {/* Project name (hidden on small) */}
        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <span className="truncate font-serif text-sm font-semibold tracking-tight text-text">
            Organizational Knowledge Gap Intelligence Platform
          </span>
        </div>

        {/* Search */}
        <div className="relative ml-auto w-full max-w-xs md:ml-6 md:mr-auto md:max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-mute" />
          <input
            type="search"
            placeholder="Search skills, employees, competencies…"
            className="w-full rounded-xl border border-line bg-panel py-2.5 pl-10 pr-4 text-sm text-text placeholder-mute shadow-sm outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary-tint"
          />
        </div>

        {/* Action icons */}
        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
          {/* Notifications dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={toggleNotifications}
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-sub transition-all duration-200 hover:bg-primary-tint hover:text-primary"
            >
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="pulse-dot absolute right-2 top-2 h-2 w-2 rounded-full bg-rust ring-2 ring-panel" />
              )}
            </button>

            <div
              className={`absolute right-0 top-full z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl backdrop-blur-xl transition-all duration-200 ${
                notifOpen
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0"
              }`}
            >
              <div className="border-b border-line px-4 py-3">
                <p className="text-sm font-semibold text-text">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {conversations.filter((c) => c.unreadCount > 0).length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-sub">
                    No new notifications
                  </p>
                ) : (
                  conversations
                    .filter((c) => c.unreadCount > 0)
                    .map((c) => (
                      <button
                        key={c.contactId}
                        onClick={() => {
                          setNotifOpen(false);
                          navigate(`/dashboard/chat?with=${c.contactId}`);
                        }}
                        className="flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-primary-tint"
                      >
                        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-grad1 to-grad2 text-sm font-semibold text-white">
                          {c.contactName?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-text">
                            New message from {c.contactName}
                          </span>
                          <span className="block truncate text-xs text-sub">
                            {c.lastMessage}
                          </span>
                        </span>
                      </button>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Messages dropdown */}
          <div className="relative" ref={messagesRef}>
            <button
              type="button"
              onClick={toggleMessages}
              aria-label="Messages"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-sub transition-all duration-200 hover:bg-primary-tint hover:text-primary"
            >
              <FiMessageSquare className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white ring-2 ring-panel">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <div
              className={`absolute right-0 top-full z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl backdrop-blur-xl transition-all duration-200 ${
                messagesOpen
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-sm font-semibold text-text">Messages</p>
                <Link
                  to="/dashboard/chat"
                  onClick={() => setMessagesOpen(false)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Open chat
                </Link>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {conversations.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-sub">
                    No messages yet
                  </p>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.contactId}
                      onClick={() => openConversation(c.contactId)}
                      className="flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-primary-tint"
                    >
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-grad1 to-grad2 text-sm font-semibold text-white">
                        {c.contactName?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-text">
                            {c.contactName}
                          </span>
                          {c.unreadCount > 0 && (
                            <span className="flex h-4 min-w-4 flex-none items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-white">
                              {c.unreadCount}
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-xs text-sub">
                          {c.lastMessage}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle dark mode"
            aria-pressed={darkMode}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-sub transition-all duration-200 hover:bg-primary-tint hover:text-primary"
          >
            {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
          </button>

          <span className="mx-1 hidden h-7 w-px bg-line sm:block" />

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
                setMessagesOpen(false);
                setNotifOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-primary-tint"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-grad1 to-grad2 text-sm font-semibold text-white shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-semibold text-text">
                  {userName}
                </span>
                <span className="block text-xs text-sub">{role}</span>
              </span>
              <FiChevronDown
                className={`hidden h-4 w-4 text-mute transition-transform duration-200 sm:block ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              role="menu"
              className={`absolute right-0 top-full z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl backdrop-blur-xl transition-all duration-200 ${
                menuOpen
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0"
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
    </header>
  )
}