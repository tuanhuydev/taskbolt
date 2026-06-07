export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

export enum ProjectType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  RESEARCH = 'RESEARCH',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  users: string[];
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  type: ProjectType;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UpdateProjectPayload {
  name?: string;
  clientName?: string;
  description?: string;
  users?: string[];
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  type?: ProjectType;
}
