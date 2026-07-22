import { useEffect, useRef, useState, useCallback } from "react";
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  searchNotifications,
  deleteNotification,
  clearAllNotifications,
} from "../../services/notificationService";
import "./Notifications.css";

const SEARCH_DEBOUNCE_MS = 350;

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
  AI_RECOMMENDATION: "✨",
  TRAINING_ASSIGNED: "🎓",
  TRAINING_DEADLINE: "⏰",
  TRAINING_COMPLETED: "✅",
  CERTIFICATION_EXPIRING: "⚠️",
  CERTIFICATION_EXPIRED: "❌",
  NEW_CHAT_MESSAGE: "💬",
  MENTORSHIP: "🤝",
  SYSTEM: "⚙️",
  ANNOUNCEMENT: "📢",
  SKILL_GAP: "📉",
  ASSESSMENT: "📝",
  ASSESSMENT_ASSIGNED: "📝",
  ASSESSMENT_REMINDER: "⏰",
  ASSESSMENT_COMPLETED: "✅",
};

const TYPE_OPTIONS = [
  "SKILL_ASSIGNED", "SKILL_UPDATED", "GAP_ANALYSIS_COMPLETED", "PROFILE_UPDATED",
  "NEW_MESSAGE", "AI_RECOMMENDATION", "TRAINING_ASSIGNED", "TRAINING_DEADLINE",
  "TRAINING_COMPLETED", "CERTIFICATION_EXPIRING", "CERTIFICATION_EXPIRED",
  "NEW_CHAT_MESSAGE", "MENTORSHIP", "SYSTEM", "ANNOUNCEMENT", "SKILL_GAP",
  "ASSESSMENT", "ASSESSMENT_ASSIGNED", "ASSESSMENT_REMINDER", "ASSESSMENT_COMPLETED",
];

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

/**
 * Small in-app confirmation modal, styled to match the Notifications page's
 * own design tokens. Replaces window.confirm(), which renders as a generic
 * unstyled browser dialog that breaks the app's visual language.
 *
 * If your app already has a shared Modal/Dialog component, swap this out for
 * that instead — this one is intentionally self-contained so it works with
 * zero other dependencies.
 */
function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <h2 id="confirm-dialog-title" className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="confirm-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="confirm-danger-btn" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Notifications() {
  const userId = useCurrentUserId();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // user-facing summary
  const [errorDetail, setErrorDetail] = useState(null); // raw backend message, shown in dev-friendly way
  const [markingAll, setMarkingAll] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Raw input value (updates every keystroke, so the box always feels responsive)
  const [keyword, setKeyword] = useState("");
  // Debounced value actually used to hit the API
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [readFilter, setReadFilter] = useState(""); // "", "true", "false"

  // Guards against out-of-order responses: if the user types fast, an older
  // (slower) request can resolve after a newer one and silently overwrite it.
  const latestRequestId = useRef(0);

  // Debounce the keyword so we don't fire a network request per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [keyword]);

  const hasActiveFilters = Boolean(debouncedKeyword || typeFilter || priorityFilter || readFilter !== "");

  const loadNotifications = useCallback(async (targetPage = 0) => {
    if (!userId) {
      setError("You need to be signed in to view notifications.");
      setErrorDetail(null);
      setLoading(false);
      return;
    }

    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    try {
      const data = hasActiveFilters
        ? await searchNotifications(
            userId,
            {
              keyword: debouncedKeyword || undefined,
              type: typeFilter || undefined,
              priority: priorityFilter || undefined,
              isRead: readFilter === "" ? undefined : readFilter === "true",
            },
            targetPage,
            20
          )
        : await getAllNotifications(userId, targetPage, 20);

      // A newer request has already started (or finished) — drop this stale result.
      if (requestId !== latestRequestId.current) return;

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.currentPage || 0);
    } catch (err) {
      if (requestId !== latestRequestId.current) return;
      console.error("[Notifications] failed to load:", err);
      setError("We couldn't load your notifications.");
      // Show the real backend/network message so the actual cause is visible
      // instead of guessing. Safe to remove once the root cause is confirmed fixed.
      setErrorDetail(err?.message || String(err));
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, [userId, debouncedKeyword, typeFilter, priorityFilter, readFilter, hasActiveFilters]);

  useEffect(() => {
    loadNotifications(0);
  }, [loadNotifications]);

  const handleMarkAsRead = async (notification) => {
    if (notification.read) {
      if (notification.actionUrl) window.location.href = notification.actionUrl;
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markAsRead(userId, notification.id);
    } catch (err) {
      console.error("[Notifications] markAsRead failed:", err);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }

    if (notification.actionUrl) window.location.href = notification.actionUrl;
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
      console.error("[Notifications] markAllAsRead failed:", err);
      setNotifications(previous);
      setError("Couldn't mark all as read.");
      setErrorDetail(err?.message || String(err));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (notification, e) => {
    e.stopPropagation();
    const previous = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    if (!notification.read) setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await deleteNotification(userId, notification.id);
    } catch (err) {
      console.error("[Notifications] deleteNotification failed:", err);
      setNotifications(previous);
      setError("Couldn't delete that notification.");
      setErrorDetail(err?.message || String(err));
    }
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    setConfirmClearOpen(true);
  };

  const confirmClearAll = async () => {
    setConfirmClearOpen(false);
    setClearing(true);
    const previous = notifications;
    setNotifications([]);
    setUnreadCount(0);

    try {
      await clearAllNotifications(userId);
    } catch (err) {
      console.error("[Notifications] clearAllNotifications failed:", err);
      setNotifications(previous);
      setError("Couldn't clear notifications.");
      setErrorDetail(err?.message || String(err));
    } finally {
      setClearing(false);
    }
  };

  const resetFilters = () => {
    setKeyword("");
    setDebouncedKeyword("");
    setTypeFilter("");
    setPriorityFilter("");
    setReadFilter("");
  };

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <div className="notifications-heading">
          <h1>Notifications</h1>
          <p className="notifications-subtext">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>
        <div className="notifications-header-actions">
          <button
            className="mark-all-btn"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markingAll}
          >
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
          <button
            className="clear-all-btn"
            onClick={handleClearAll}
            disabled={notifications.length === 0 || clearing}
          >
            {clearing ? "Clearing..." : "Clear all"}
          </button>
        </div>
      </header>

      <div className="notifications-filters">
        <input
          type="text"
          placeholder="Search notifications..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="filter-input"
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="filter-select">
          <option value="">All types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t.replaceAll("_", " ")}</option>
          ))}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="filter-select">
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select value={readFilter} onChange={(e) => setReadFilter(e.target.value)} className="filter-select">
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
        {hasActiveFilters && (
          <button type="button" className="reset-filters-btn" onClick={resetFilters}>
            Reset filters
          </button>
        )}
      </div>

      {loading && <div className="notifications-state">Loading notifications...</div>}

      {!loading && error && (
        <div className="notifications-state notifications-error">
          <p className="error-summary">{error}</p>
          {errorDetail && <p className="error-detail">{errorDetail}</p>}
          <button onClick={() => loadNotifications(page)} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="notifications-state">
          {hasActiveFilters
            ? "No notifications match your filters."
            : "No notifications yet. We'll let you know when something needs your attention."}
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <>
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
                  <div className="notification-title-row">
                    <p className="notification-title">{n.title}</p>
                    {n.priority && (
                      <span className={`priority-badge priority-${n.priority.toLowerCase()}`}>
                        {n.priority}
                      </span>
                    )}
                  </div>
                  <p className="notification-message">{n.message}</p>
                  <p className="notification-time">{n.timeAgo}</p>
                </div>
                <div className="notification-actions">
                  {!n.read && <span className="unread-dot" aria-label="Unread" />}
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDelete(n, e)}
                    aria-label="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="notifications-pagination">
              <button disabled={page === 0} onClick={() => loadNotifications(page - 1)}>
                Previous
              </button>
              <span>Page {page + 1} of {totalPages}</span>
              <button disabled={page + 1 >= totalPages} onClick={() => loadNotifications(page + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmClearOpen}
        title="Clear all notifications?"
        message="This can't be undone. All notifications in your list will be permanently removed."
        confirmLabel="Clear all"
        onConfirm={confirmClearAll}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
}

export default Notifications;