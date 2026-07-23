import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getUnreadCount,
  getUnreadNotifications,
  markAsRead,
} from "../services/notificationService";
import "./NotificationBell.css";

const POLL_INTERVAL_MS = 30000;

function useCurrentUserId() {
  return localStorage.getItem("userId");
}

function NotificationBell() {
  const userId = useCurrentUserId();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preview, setPreview] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const dropdownRef = useRef(null);

  const refreshCount = useCallback(async () => {
    if (!userId) return;
    try {
      const count = await getUnreadCount(userId);
      setUnreadCount(count || 0);
    } catch {
      // silent fail on badge refresh, avoid noisy UI
    }
  }, [userId]);

  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshCount]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && userId) {
      setLoadingPreview(true);
      try {
        const unread = await getUnreadNotifications(userId);
        setPreview((unread || []).slice(0, 5));
      } catch {
        setPreview([]);
      } finally {
        setLoadingPreview(false);
      }
    }
  };

  const handleItemClick = async (n) => {
    setPreview((prev) => prev.filter((x) => x.id !== n.id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markAsRead(userId, n.id);
    } catch {
      // count will self-correct on next poll
    }
    if (n.actionUrl) window.location.href = n.actionUrl;
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-bell-btn"
        onClick={toggleOpen}
        aria-label="Notifications"
      >
        <span className="notification-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-bell-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-bell-dropdown">
          <div className="notification-bell-header">
            <span>Notifications</span>
            <Link to="/notifications" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>

          {loadingPreview && (
            <div className="notification-bell-empty">Loading...</div>
          )}

          {!loadingPreview && preview.length === 0 && (
            <div className="notification-bell-empty">
              You're all caught up
            </div>
          )}

          {!loadingPreview &&
            preview.map((n) => (
              <div
                key={n.id}
                className="notification-bell-item"
                onClick={() => handleItemClick(n)}
              >
                <p className="notification-bell-item-title">{n.title}</p>
                <p className="notification-bell-item-message">{n.message}</p>
                <p className="notification-bell-item-time">{n.timeAgo}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;