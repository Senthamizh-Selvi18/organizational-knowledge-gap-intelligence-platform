// notificationService.js
// Talks to NotificationController.java (/api/notifications/**)

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/notifications`;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Custom error that carries the HTTP status and the parsed backend message
 * (if the backend returned JSON like { message: "..." } or a plain string),
 * so callers can show something more useful than "request failed".
 */
class ApiError extends Error {
  constructor(message, status, url) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

async function fetchJson(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });
  } catch (networkErr) {
    // fetch() itself threw: DNS/CORS/network down, request never reached the server.
    console.error("[notificationService] network error calling", url, networkErr);
    throw new ApiError(
      "Network error — could not reach the server. Check your connection or CORS settings.",
      0,
      url
    );
  }

  const rawText = await res.text().catch(() => "");
  let parsedBody = null;
  if (rawText) {
    try {
      parsedBody = JSON.parse(rawText);
    } catch {
      // not JSON, that's fine, we'll just use rawText
    }
  }

  if (!res.ok) {
    const backendMessage =
      (parsedBody && (parsedBody.message || parsedBody.error)) || rawText || null;
    console.error(
      `[notificationService] ${options.method || "GET"} ${url} -> ${res.status}`,
      backendMessage
    );
    throw new ApiError(
      backendMessage || `Request failed with status ${res.status}`,
      res.status,
      url
    );
  }

  return parsedBody !== null ? parsedBody : rawText;
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

/**
 * filters: { keyword, type, priority, isRead, startDate, endDate }
 * Only defined/non-empty values are sent, so untouched filters are simply
 * omitted from the query string rather than sent as "undefined" or "".
 */
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