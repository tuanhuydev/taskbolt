export enum GrantResourceType {
  PROJECT = "project",
}

export interface ResourceGrant {
  id: string;
  tenantId: string | null;
  userId: string;
  resourceType: GrantResourceType;
  resourceId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateResourceGrantPayload {
  userId: string;
  resourceType: GrantResourceType;
  resourceId: string;
  roleId: string;
}

export interface UpdateResourceGrantPayload {
  roleId: string;
}
