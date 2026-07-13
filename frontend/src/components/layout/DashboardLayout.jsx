import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg font-sans">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-tint via-bg to-primary-tint" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl float-slow" />
        <div
          className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-grad2/20 blur-3xl float-slow"
          style={{ animationDelay: "1.2s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#211B33 1px, transparent 1px), linear-gradient(90deg, #211B33 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      <div className="flex h-screen flex-1 flex-col lg:ml-64">
  <Navbar onMenuClick={() => setSidebarOpen(true)} />

  <main className="flex-1 overflow-hidden">
    {children}
  </main>
</div>
        
      </div>
    </div>
  );
}