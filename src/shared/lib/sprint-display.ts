import { SprintStatus } from "@/shared/types/sprint";

// Active sprints surface first (what you're working on now), then planned,
// then completed last — shared so the backlog grouping order stays
// configurable in one place rather than redefined per page.
export const SPRINT_STATUS_ORDER: Record<SprintStatus, number> = {
  [SprintStatus.ACTIVE]: 0,
  [SprintStatus.PLANNED]: 1,
  [SprintStatus.COMPLETED]: 2,
};
