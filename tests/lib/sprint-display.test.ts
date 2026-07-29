import { describe, it, expect } from "vitest";
import { SPRINT_STATUS_ORDER } from "@/shared/lib/sprint-display";
import { SprintStatus } from "@/shared/types/sprint";

describe("SPRINT_STATUS_ORDER", () => {
  it("orders active before planned before completed", () => {
    expect(SPRINT_STATUS_ORDER[SprintStatus.ACTIVE]).toBeLessThan(
      SPRINT_STATUS_ORDER[SprintStatus.PLANNED],
    );
    expect(SPRINT_STATUS_ORDER[SprintStatus.PLANNED]).toBeLessThan(
      SPRINT_STATUS_ORDER[SprintStatus.COMPLETED],
    );
  });

  it("defines an order for every SprintStatus value", () => {
    for (const status of Object.values(SprintStatus)) {
      expect(SPRINT_STATUS_ORDER[status]).toBeTypeOf("number");
    }
  });
});
