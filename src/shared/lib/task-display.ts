import { TaskType } from "@/shared/types/task";
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
