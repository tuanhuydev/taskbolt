import { APP_AUTH_URL } from "@/shared/lib/constants";
import { ApiClient } from "@/shared/types/shell-services";
import { Task, UpdateTaskPayload } from "@/shared/types/task";

interface TaskResponse {
  tasks: Array<Task>;
  total: number;
}

export const getTasks = async (apiClient: ApiClient, filter: Record<string, unknown> = {}) => {
  const queryParams = new URLSearchParams(filter as Record<string, string>).toString();
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/tasks${queryParams ? `?${queryParams}` : ""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks (${response.status})`);
    }

    const { tasks }: TaskResponse = await response.json();
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const updateTask = async (
  apiClient: ApiClient,
  taskId: string,
  data: Omit<UpdateTaskPayload, "id">,
): Promise<Task> => {
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to update task (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};