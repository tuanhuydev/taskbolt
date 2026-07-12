import { APP_AUTH_URL } from "@/shared/lib/constants";
import { ApiClient } from "@/shared/types/shell-services";
import { Role } from "@/shared/types/role";

export const getRoles = async (apiClient: ApiClient, tenantId?: string) => {
  const queryParams = tenantId ? `?tenantId=${tenantId}` : "";
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/roles${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch roles (${response.status})`);
    }

    const roles: Role[] = await response.json();
    return roles;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};
