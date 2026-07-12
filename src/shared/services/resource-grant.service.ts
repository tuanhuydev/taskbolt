import { APP_AUTH_URL } from "@/shared/lib/constants";
import { ApiClient } from "@/shared/types/shell-services";
import {
  ResourceGrant,
  CreateResourceGrantPayload,
  UpdateResourceGrantPayload,
} from "@/shared/types/resource-grant";

export const getResourceGrants = async (
  apiClient: ApiClient,
  filter: Record<string, unknown> = {},
) => {
  const queryParams = new URLSearchParams(filter as Record<string, string>).toString();
  try {
    const response = await apiClient.request(
      `${APP_AUTH_URL}/resource-grants${queryParams ? `?${queryParams}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch resource grants (${response.status})`);
    }

    const grants: ResourceGrant[] = await response.json();
    return grants;
  } catch (error) {
    console.error("Error fetching resource grants:", error);
    throw error;
  }
};

export const createResourceGrant = async (
  apiClient: ApiClient,
  data: CreateResourceGrantPayload,
) => {
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/resource-grants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create resource grant (${response.status})`);
    }

    const grant: ResourceGrant = await response.json();
    return grant;
  } catch (error) {
    console.error("Error creating resource grant:", error);
    throw error;
  }
};

export const updateResourceGrant = async (
  apiClient: ApiClient,
  grantId: string,
  data: UpdateResourceGrantPayload,
) => {
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/resource-grants/${grantId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update resource grant (${response.status})`);
    }

    const grant: ResourceGrant = await response.json();
    return grant;
  } catch (error) {
    console.error("Error updating resource grant:", error);
    throw error;
  }
};

export const deleteResourceGrant = async (apiClient: ApiClient, grantId: string) => {
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/resource-grants/${grantId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete resource grant (${response.status})`);
    }
  } catch (error) {
    console.error("Error deleting resource grant:", error);
    throw error;
  }
};
