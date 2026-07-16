import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { toast } from "../../components/ui/Toast.jsx";
import {
  getRecentNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";
import {
  FiBell,
  FiCheckCircle,
  FiUserPlus,
  FiRefreshCw,
  FiBarChart2,
  FiUser,
  FiCheck,
  FiInbox,
} from "react-icons/fi";

const TYPE_META = {
  SKILL_ASSIGNED: { icon: FiUserPlus, color: "bg-blue-100 text-blue-700" },
  SKILL_UPDATED: { icon: FiRefreshCw, color: "bg-purple-100 text-purple-700" },
  GAP_ANALYSIS_COMPLETED: { icon: FiBarChart2, color: "bg-green-100 text-green-700" },
  PROFILE_UPDATED: { icon: FiUser, color: "bg-amber-100 text-amber-700" },
};

function iconFor(type) {
  return TYPE_META[type]?.icon || FiBell;
}

function colorFor(type) {
  return TYPE_META[type]?.color || "bg-primary-tint text-primary";
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRecentNotifications(50);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAsRead = async (id) => {
    try {
      setMarkingId(id);
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
      toast.error("Could not mark notification as read.");
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch (err) {
      console.error(err);
      toast.error("Could not mark all notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FiBell className="text-primary" />
              Notifications
            </h1>
            <p className="text-sub">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
                : "You're all caught up."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={markingAll || unreadCount === 0}
            className="flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2 text-sm font-medium text-sub transition-colors hover:bg-primary-tint hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCheck className="h-4 w-4" />
            Mark all as read
          </button>
        </div>

        <div className="rounded-3xl border border-line bg-panel shadow-xl">
          {loading ? (
            <div className="p-10 text-center text-sub">Loading notifications…</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-14 text-center text-sub">
              <FiInbox className="h-8 w-8" />
              <p className="font-medium text-text">No notifications yet</p>
              <p className="text-sm">We'll let you know when something needs your attention.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {notifications.map((n) => {
                const Icon = iconFor(n.type);
                return (
                  <li
                    key={n.id}
                    className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                      n.read ? "" : "bg-primary-tint/40"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorFor(n.type)}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-text">{n.title}</p>
                        {!n.read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-rust" aria-label="Unread" />
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-sub">{n.message}</p>
                      <p className="mt-1 text-xs text-mute">{n.timeAgo}</p>
                    </div>

                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(n.id)}
                        disabled={markingId === n.id}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary-tint disabled:opacity-50"
                      >
                        <FiCheckCircle className="h-3.5 w-3.5" />
                        Mark as read
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
