export enum TaskType {
  STORY = "STORY",
  EPIC = "EPIC",
  ISSUE = "ISSUE",
  BUG = "BUG",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
  CLOSED = "CLOSED",
}

export enum TaskPriority {
  HIGHEST = "HIGHEST",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  storyPoint: number;
  assigneeId: string | null;
  parentId: string | null;
  status: TaskStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  projectId: string | null;
  subTasks: Task[];
  sprintId: string | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  type: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  storyPoint?: number;
  assigneeId?: string | null;
  parentId?: string | null;
  projectId?: string | null;
  sprintId?: string | null;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: string;
}
