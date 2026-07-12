export enum AccountType {
  PERSON = "person",
  SERVICE = "service",
}

export enum AccountStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  accountType: AccountType;
  roleId?: string;
  tenantId?: string;
  status: AccountStatus;
}
