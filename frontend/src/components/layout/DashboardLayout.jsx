import { useState } from "react"
import { useLocation } from "react-router-dom"
import Sidebar from "./Sidebar.jsx"
import Navbar from "./Navbar.jsx"

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    // .app { display:flex; min-height:100vh } from the reference —
    // sidebar + main sit side by side exactly as in the mockup.
    <div className="flex min-h-screen bg-bg font-sans">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* key={pathname} remounts this on every navigation, which is
            what drives the .page-transition fade/slide-in defined in
            index.css — every page gets a fresh entrance animation. */}
        <main
          key={location.pathname}
          className="page-transition flex-1 min-w-0 p-6 sm:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
