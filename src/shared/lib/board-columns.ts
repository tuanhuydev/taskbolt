import { TaskStatus } from "@/shared/types/task";

export interface BoardColumn {
  id: TaskStatus;
  name: string;
  accentClass: string;
  countClass: string;
}

// Column identity, order, and styling for the Active Sprint kanban board —
// shared so board layout isn't redefined per page and stays one place to
// reconfigure (e.g. adding a column, reordering, restyling).
export const BOARD_COLUMNS: BoardColumn[] = [
  {
    id: TaskStatus.TODO,
    name: "To do",
    accentClass: "bg-slate-400",
    countClass: "bg-slate-200 text-slate-700",
  },
  {
    id: TaskStatus.IN_PROGRESS,
    name: "In progress",
    accentClass: "bg-primary",
    countClass: "bg-slate-200 text-slate-700",
  },
  {
    id: TaskStatus.DONE,
    name: "Done",
    accentClass: "bg-green-600",
    countClass: "bg-green-100 text-green-700",
  },
];

// Closed (obsoleted) tasks don't get their own column — they're folded into
// Done so completed-but-obsoleted work is still visible on the board instead
// of vanishing, without adding a 4th column for what's a rare edge case.
export function boardColumnIdFor(status: TaskStatus): TaskStatus {
  return status === TaskStatus.CLOSED ? TaskStatus.DONE : status;
}
