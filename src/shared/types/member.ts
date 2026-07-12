export interface ProjectMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  projectId: string;
  role: string;
  addedAt: string;
  addedById?: string;
}

export interface AddProjectMemberPayload {
  userId: string;
  roleId: string;
}

export interface UpdateMemberRolePayload {
  roleId: string;
}
