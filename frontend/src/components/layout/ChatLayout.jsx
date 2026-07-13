import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function ChatLayout({ children }) {
  return (
    <div className="h-screen flex bg-bg">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar />

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}