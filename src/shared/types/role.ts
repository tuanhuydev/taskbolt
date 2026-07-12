export interface Role {
  id: string;
  tenantId: string | null;
  name: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}
