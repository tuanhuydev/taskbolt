import { APP_AUTH_URL } from "@/shared/lib/constants";
import { ApiClient } from "@/shared/types/shell-services";
import { User } from "@/shared/types/user";

interface UserResponse {
  users: Array<User>;
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export const getUsers = async (apiClient: ApiClient, filter: Record<string, unknown> = {}) => {
  const queryParams = new URLSearchParams(filter as Record<string, string>).toString();
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/users${queryParams ? `?${queryParams}` : ""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users (${response.status})`);
    }

    const { users }: UserResponse = await response.json();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
