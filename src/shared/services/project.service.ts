import { APP_AUTH_URL } from "@/shared/lib/constants";
import { ApiClient } from "@/shared/types/shell-services";
import { Project } from "@/shared/types/project";

interface ProjectResponse {
  projects: Array<Project>;
  total: number;
}

export const getProjects = async (apiClient: ApiClient, filter: Record<string, unknown> = {}) => {
  const queryParams = new URLSearchParams(filter as Record<string, string>).toString();
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/projects${queryParams ? `?${queryParams}` : ''}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects (${response.status})`);
    }

    const { projects }: ProjectResponse = await response.json();
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const getProjectById = async (apiClient: ApiClient, projectId: string) => {
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/projects/${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project (${response.status})`);
    }

    const project: Project = await response.json();
    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};
