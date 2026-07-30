import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import Sidebar from "./Sidebar.jsx"
import Navbar from "./Navbar.jsx"

const STORAGE_KEY = "userSettings"
const getStoredLayout = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return "comfortable"
    const parsed = JSON.parse(raw)
    return parsed.dashboardLayout === "compact" ? "compact" : "comfortable"
  } catch {
    return "comfortable"
  }
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const [layout, setLayout] = useState(getStoredLayout)

  useEffect(() => {
    const handleLayoutChange = (e) => {
      setLayout(e?.detail === "compact" ? "compact" : getStoredLayout())
    }
    window.addEventListener("layoutchange", handleLayoutChange)
    return () => window.removeEventListener("layoutchange", handleLayoutChange)
  }, [])

  const isCompact = layout === "compact"

  return (
    // h-screen + overflow-hidden (instead of min-h-screen) pins the shell to
    // exactly one viewport: the sidebar and navbar never scroll away. Any
    // page whose content is taller than the available space scrolls inside
    // <main> only (overflow-y-auto below), not the whole document. Pages
    // that fit — like Chat, sized with h-full — simply won't show a
    // scrollbar there at all.
    <div className="flex h-screen overflow-hidden bg-bg font-sans">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* key={pathname} remounts this on every navigation, which is
            what drives the .page-transition fade/slide-in defined in
            index.css — every page gets a fresh entrance animation.
            The "layout-compact" class (see index.css) is what makes
            the Dashboard Layout setting actually change the UI. */}
        <main
          key={location.pathname}
          className={`page-transition min-h-0 flex-1 min-w-0 overflow-y-auto ${
            isCompact ? "p-4 sm:p-5 layout-compact" : "p-6 sm:p-8"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}