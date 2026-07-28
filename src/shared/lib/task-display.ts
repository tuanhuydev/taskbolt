import { TaskType, TaskPriority } from "@/shared/types/task";
import type { BadgeVariants } from "@/shared/components/ui/badge";

interface TaskTypeDisplay {
  variant: NonNullable<BadgeVariants["variant"]>;
}

const TASK_TYPE_MAP: Record<TaskType, TaskTypeDisplay> = {
  [TaskType.STORY]: { variant: "brand" },
  [TaskType.EPIC]: { variant: "purple" },
  [TaskType.ISSUE]: { variant: "info" },
  [TaskType.BUG]: { variant: "danger" },
};

export function taskTypeVariant(type: TaskType): NonNullable<BadgeVariants["variant"]> {
  return (TASK_TYPE_MAP[type] ?? TASK_TYPE_MAP[TaskType.STORY]).variant;
}

export function formatTicketId(id: string): string {
  return `TSK-${id.slice(0, 6).toUpperCase()}`;
}
  
export const TASK_TYPE_CLASSES: Record<TaskType, string> = {
  [TaskType.STORY]: "bg-blue-50 text-blue-700",
  [TaskType.EPIC]: "bg-violet-50 text-violet-700",
  [TaskType.ISSUE]: "bg-sky-50 text-sky-700",
  [TaskType.BUG]: "bg-red-50 text-red-700",
};

export function taskTypeClasses(type: TaskType): string {
  return TASK_TYPE_CLASSES[type] ?? "bg-slate-100 text-slate-700";
}

export interface TaskPriorityStyle {
  dotClass: string;
  textClass: string;
}

const TASK_PRIORITY_STYLE: Record<TaskPriority, TaskPriorityStyle> = {
  [TaskPriority.HIGHEST]: { dotClass: "bg-red-500", textClass: "text-red-700" },
  [TaskPriority.HIGH]: { dotClass: "bg-red-500", textClass: "text-red-700" },
  [TaskPriority.MEDIUM]: { dotClass: "bg-amber-500", textClass: "text-amber-700" },
  [TaskPriority.LOW]: { dotClass: "bg-slate-400", textClass: "text-slate-400" },
};

export function taskPriorityStyle(priority: TaskPriority): TaskPriorityStyle {
  return TASK_PRIORITY_STYLE[priority] ?? TASK_PRIORITY_STYLE[TaskPriority.LOW];
}
