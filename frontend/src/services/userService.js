const API_URL = "http://localhost:8080";

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