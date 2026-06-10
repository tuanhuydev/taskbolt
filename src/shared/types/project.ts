export enum ProjectStatus {
  GOING = 'going',
  PLAN = 'plan',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

export enum ProjectType {
  OUTSOURCE = 'outsource',
  PRODUCT = 'product',
  POC = 'poc',
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

export interface CreateProjectPayload {
  name: string;
  clientName?: string;
  description?: string;
  users?: string[];
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  type: ProjectType;
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
