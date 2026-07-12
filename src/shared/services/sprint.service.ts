import { APP_AUTH_URL } from "@/shared/lib/constants";
import { ApiClient } from "@/shared/types/shell-services";
import {
  Sprint,
  SprintStatus,
  CreateSprintPayload,
  type UpdateSprintRequestPayload,
} from "@/shared/types/sprint";

// Map any casing variant the API may return to the canonical SprintStatus enum value.
const STATUS_ALIASES: Record<string, SprintStatus> = {
  planning: SprintStatus.PLANNED,
  planned: SprintStatus.PLANNED,
  active: SprintStatus.ACTIVE,
  completed: SprintStatus.COMPLETED,
};

function normalizeSprintStatus(raw: string): SprintStatus {
  return (
    STATUS_ALIASES[raw.toLowerCase()] ?? (raw.toLowerCase() as SprintStatus)
  );
}

function normalizeSprint(sprint: Sprint): Sprint {
  if (!sprint.status) return sprint;
  return {
    ...sprint,
    status: normalizeSprintStatus(sprint.status as unknown as string),
  };
}

interface SprintResponse {
  sprints: Array<Sprint>;
  total: number;
}

export const getSprints = async (
  apiClient: ApiClient,
  filter: Record<string, unknown> = {},
) => {
  const queryParams = new URLSearchParams(
    filter as Record<string, string>,
  ).toString();
  try {
    const response = await apiClient.request(
      `${APP_AUTH_URL}/sprints${queryParams ? `?${queryParams}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sprints (${response.status})`);
    }

    const { sprints }: SprintResponse = await response.json();
    return sprints.map(normalizeSprint);
  } catch (error) {
    console.error("Error fetching sprints:", error);
    throw error;
  }
};

export const createSprint = async (
  apiClient: ApiClient,
  data: CreateSprintPayload,
) => {
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/sprints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create sprint (${response.status})`);
    }

    const sprint: Sprint = await response.json();
    return sprint;
  } catch (error) {
    console.error("Error creating sprint:", error);
    throw error;
  }
};

export const updateSprint = async (
  apiClient: ApiClient,
  sprintId: string,
  data: UpdateSprintRequestPayload,
) => {
  try {
    const response = await apiClient.request(
      `${APP_AUTH_URL}/sprints/${sprintId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update sprint (${response.status})`);
    }

    const sprint: Sprint = await response.json();
    return sprint;
  } catch (error) {
    console.error("Error updating sprint:", error);
    throw error;
  }
};

export const deleteSprint = async (apiClient: ApiClient, sprintId: string) => {
  try {
    const response = await apiClient.request(
      `${APP_AUTH_URL}/sprints/${sprintId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to delete sprint (${response.status})`);
    }
  } catch (error) {
    console.error("Error deleting sprint:", error);
    throw error;
  }
};
