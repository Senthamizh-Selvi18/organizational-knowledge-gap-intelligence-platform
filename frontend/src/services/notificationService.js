// notificationService.js
// Talks to NotificationController.java (/api/notifications/**)
//
// NOTE: If your app already has a shared axios instance (e.g. api/axiosInstance.js)
// with auth headers/interceptors baked in, use that instead of the raw fetch calls
// below — just swap the fetchJson() internals to `axiosInstance.get(...)` etc.
// This version assumes a JWT is stored in localStorage under "token".

const API_BASE = "/api/notifications";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

export function getRecentNotifications(userId, limit = 20) {
  return fetchJson(`${API_BASE}/${userId}?limit=${limit}`);
}

export function getUnreadCount(userId) {
  return fetchJson(`${API_BASE}/${userId}/unread-count`);
}

export function markAsRead(userId, notificationId) {
  return fetchJson(`${API_BASE}/${userId}/${notificationId}/read`, {
    method: "PUT",
  });
}

export function markAllAsRead(userId) {
  return fetchJson(`${API_BASE}/${userId}/read-all`, {
    method: "PUT",
  });
}