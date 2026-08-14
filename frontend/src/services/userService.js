const API_URL = import.meta.env.VITE_API_BASE_URL + "";

export async function getAllUsers() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/api/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }

  return data;
}