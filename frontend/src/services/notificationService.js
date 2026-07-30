// notificationService.js
// Talks to NotificationController.java (/api/notifications/**)

const API_BASE = "http://localhost:8080/api/notifications";

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

function buildQuery(params) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      usp.append(key, String(value));
    }
  });
  return usp.toString();
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

export function getAllNotifications(userId, page = 0, size = 20) {
  const query = buildQuery({ page, size });
  return fetchJson(`${API_BASE}/${userId}/all?${query}`);
}

export function getUnreadNotifications(userId) {
  return fetchJson(`${API_BASE}/${userId}/unread-list`);
}

export function searchNotifications(userId, filters = {}, page = 0, size = 20) {
  const query = buildQuery({ ...filters, page, size });
  return fetchJson(`${API_BASE}/${userId}/search?${query}`);
}

export function deleteNotification(userId, notificationId) {
  return fetchJson(`${API_BASE}/${userId}/${notificationId}`, {
    method: "DELETE",
  });
}

export function clearAllNotifications(userId) {
  return fetchJson(`${API_BASE}/${userId}/clear`, {
    method: "DELETE",
  });
}

export function createNotification(payload) {
  return fetchJson(`${API_BASE}/create`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}