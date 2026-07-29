import { describe, it, expect } from "vitest";
import { BOARD_COLUMNS, boardColumnIdFor } from "@/shared/lib/board-columns";
import { TaskStatus } from "@/shared/types/task";

describe("BOARD_COLUMNS", () => {
  it("defines exactly TODO, IN_PROGRESS, DONE in that order", () => {
    expect(BOARD_COLUMNS.map((col) => col.id)).toEqual([
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ]);
  });
});

describe("boardColumnIdFor", () => {
  it("folds CLOSED into the DONE column", () => {
    expect(boardColumnIdFor(TaskStatus.CLOSED)).toBe(TaskStatus.DONE);
  });

  it("maps every other status to itself", () => {
    expect(boardColumnIdFor(TaskStatus.TODO)).toBe(TaskStatus.TODO);
    expect(boardColumnIdFor(TaskStatus.IN_PROGRESS)).toBe(TaskStatus.IN_PROGRESS);
    expect(boardColumnIdFor(TaskStatus.DONE)).toBe(TaskStatus.DONE);
    expect(boardColumnIdFor(TaskStatus.IN_REVIEW)).toBe(TaskStatus.IN_REVIEW);
  });
});
