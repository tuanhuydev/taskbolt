import { ApiClient } from "@/shared/types/shell-services";
import { ProjectMember, AddProjectMemberPayload, UpdateMemberRolePayload } from "@/shared/types/member";
import { GrantResourceType } from "@/shared/types/resource-grant";
import { AccountStatus } from "@/shared/types/user";
import { getResourceGrants, createResourceGrant, updateResourceGrant, deleteResourceGrant } from "./resource-grant.service";
import { getRoles } from "./role.service";
import { getUsers } from "./user.service";

/**
 * "Project members" aren't a first-class backend resource — access is
 * modeled as a ResourceGrant (userId + roleId) scoped to the project. This
 * joins grants + roles + users client-side into the ProjectMember shape the
 * rest of the app (TaskDetail assignee/reporter, TaskFormFields assignee
 * select, ProjectMemberManagement) already consumes.
 */
export const getProjectMembers = async (
  apiClient: ApiClient,
  projectId: string,
): Promise<ProjectMember[]> => {
  try {
    const [grants, roles, users] = await Promise.all([
      getResourceGrants(apiClient, {
        resourceType: GrantResourceType.PROJECT,
        resourceId: projectId,
      }),
      getRoles(apiClient),
      getUsers(apiClient, { status: AccountStatus.ACTIVE, limit: 1000 }),
    ]);

    const roleMap = new Map(roles.map((role) => [role.id, role]));
    const userMap = new Map(users.map((user) => [user.id, user]));

    return grants.reduce<ProjectMember[]>((members, grant) => {
      const user = userMap.get(grant.userId);
      if (!user) return members;

      members.push({
        id: grant.id,
        userId: grant.userId,
        userName: user.name,
        userEmail: user.email,
        projectId,
        role: roleMap.get(grant.roleId)?.name ?? grant.roleId,
        addedAt: grant.createdAt,
      });
      return members;
    }, []);
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
  return createResourceGrant(apiClient, {
    userId: data.userId,
    resourceType: GrantResourceType.PROJECT,
    resourceId: projectId,
    roleId: data.roleId,
  });
};

export const updateMemberRole = async (
  apiClient: ApiClient,
  _projectId: string,
  memberId: string,
  data: UpdateMemberRolePayload,
) => {
  return updateResourceGrant(apiClient, memberId, { roleId: data.roleId });
};

export const removeProjectMember = async (
  apiClient: ApiClient,
  _projectId: string,
  memberId: string,
) => {
  await deleteResourceGrant(apiClient, memberId);
  return true;
};
