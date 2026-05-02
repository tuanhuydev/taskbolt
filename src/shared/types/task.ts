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
  assigneeId: string | null;
  parentId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoint?: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  projectId: string;
  subTasks: Task[];
  sprintId: string | null;
}
