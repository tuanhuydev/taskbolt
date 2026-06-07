import { APP_AUTH_URL } from "@/shared/lib/constants";
import { ApiClient } from "@/shared/types/shell-services";
import {
  ProjectMember,
  AddProjectMemberPayload,
  UpdateMemberRolePayload,
} from "@/shared/types/member";

interface MemberResponse {
  members: Array<ProjectMember>;
  total: number;
}

export const getProjectMembers = async (
  apiClient: ApiClient,
  projectId: string,
  filter: Record<string, unknown> = {},
) => {
  const queryParams = new URLSearchParams(filter as Record<string, string>).toString();
  try {
    const response = await apiClient.request(
      `${APP_AUTH_URL}/projects/${projectId}/members${queryParams ? `?${queryParams}` : ''}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch project members (${response.status})`);
    }

    const { members }: MemberResponse = await response.json();
    return members;
  } catch (error) {
    console.error("Error fetching project members:", error);
    throw error;
  }
};

export const addProjectMember = async (
  apiClient: ApiClient,
  projectId: string,
  data: AddProjectMemberPayload,
) => {
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/projects/${projectId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to add project member (${response.status})`);
    }

    const member: ProjectMember = await response.json();
    return member;
  } catch (error) {
    console.error("Error adding project member:", error);
    throw error;
  }
};

export const updateMemberRole = async (
  apiClient: ApiClient,
  projectId: string,
  memberId: string,
  data: UpdateMemberRolePayload,
) => {
  try {
    const response = await apiClient.request(
      `${APP_AUTH_URL}/projects/${projectId}/members/${memberId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update member role (${response.status})`);
    }

    const member: ProjectMember = await response.json();
    return member;
  } catch (error) {
    console.error("Error updating member role:", error);
    throw error;
  }
};

export const removeProjectMember = async (
  apiClient: ApiClient,
  projectId: string,
  memberId: string,
) => {
  try {
    const response = await apiClient.request(
      `${APP_AUTH_URL}/projects/${projectId}/members/${memberId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to remove project member (${response.status})`);
    }

    return true;
  } catch (error) {
    console.error("Error removing project member:", error);
    throw error;
  }
};
