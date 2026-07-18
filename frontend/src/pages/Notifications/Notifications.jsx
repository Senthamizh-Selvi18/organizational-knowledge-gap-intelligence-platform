import { useEffect, useState, useCallback } from "react";
import {
  getRecentNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";
import "./Notifications.css";

// NOTE: adjust how you read the logged-in user's id to match your auth setup
// (e.g. from context, redux, or a decoded JWT). This assumes it's stored
// in localStorage as "userId".
function useCurrentUserId() {
  return localStorage.getItem("userId");
}

const TYPE_ICON = {
  SKILL_ASSIGNED: "📌",
  SKILL_UPDATED: "🛠️",
  GAP_ANALYSIS_COMPLETED: "📊",
  PROFILE_UPDATED: "👤",
  NEW_MESSAGE: "💬",
};

function Notifications() {
  const userId = useCurrentUserId();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setError("You need to be signed in to view notifications.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getRecentNotifications(userId, 20);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError("We couldn't load your notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notification) => {
    if (notification.read) return;

    // optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markAsRead(userId, notification.id);
    } catch (err) {
      // revert on failure
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read: false } : n
        )
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setMarkingAll(true);
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await markAllAsRead(userId);
    } catch (err) {
      setNotifications(previous);
      setError("Couldn't mark all as read. Please try again.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p className="notifications-subtext">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>
        <button
          className="mark-all-btn"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || markingAll}
        >
          {markingAll ? "Marking..." : "Mark all as read"}
        </button>
      </header>

      {loading && <div className="notifications-state">Loading notifications...</div>}

      {!loading && error && (
        <div className="notifications-state notifications-error">
          {error}
          <button onClick={loadNotifications} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="notifications-state">
          No notifications yet. We'll let you know when something needs your attention.
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <ul className="notifications-list">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`notification-item ${n.read ? "read" : "unread"}`}
              onClick={() => handleMarkAsRead(n)}
            >
              <span className="notification-icon">
                {TYPE_ICON[n.type] || "🔔"}
              </span>
              <div className="notification-body">
                <p className="notification-title">{n.title}</p>
                <p className="notification-message">{n.message}</p>
                <p className="notification-time">{n.timeAgo}</p>
              </div>
              {!n.read && <span className="unread-dot" aria-label="Unread" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;