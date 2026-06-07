export enum SprintStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  status: SprintStatus;
  startDate: string | null;
  endDate: string | null;
  goal: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSprintPayload {
  name: string;
  projectId: string;
  startDate?: string | null;
  endDate?: string | null;
  goal?: string | null;
}

export interface UpdateSprintPayload extends Partial<Omit<CreateSprintPayload, 'projectId'>> {
  id: string;
  status?: SprintStatus;
}
