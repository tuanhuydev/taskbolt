import { describe, it, expect } from "vitest";
import { formatTicketId } from "@/shared/lib/task-display";

describe("formatTicketId", () => {
  it("prefixes with TSK- and uppercases the first 6 characters of the id", () => {
    expect(formatTicketId("abc123def456")).toBe("TSK-ABC123");
  });

  it("is deterministic for the same id", () => {
    expect(formatTicketId("6a1b2c3d4e5f")).toBe(formatTicketId("6a1b2c3d4e5f"));
  });

  it("handles ids shorter than 6 characters without padding", () => {
    expect(formatTicketId("ab1")).toBe("TSK-AB1");
  });
});
