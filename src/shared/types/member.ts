export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export interface ProjectMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  projectId: string;
  role: MemberRole;
  addedAt: string;
  addedById: string;
}

export interface AddProjectMemberPayload {
  userId: string;
  role: MemberRole;
}

export interface UpdateMemberRolePayload {
  role: MemberRole;
}
