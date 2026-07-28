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

// Short "ticket badge" label shown on task cards (Active Sprint board, My
// Tasks) — not an identifier used for lookups, just a compact display of
// the task id. Kept separate from TaskDetailHeader's copy-to-clipboard id
// format, which needs to stay long enough to reliably distinguish tasks.
export function formatTicketId(id: string): string {
  return `TSK-${id.slice(0, 6).toUpperCase()}`;
}
