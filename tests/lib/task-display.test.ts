import { describe, it, expect } from "vitest";
import { taskTypeClasses, taskPriorityStyle, taskTypeVariant, formatTicketId } from "@/shared/lib/task-display";
import { TaskType, TaskPriority } from "@/shared/types/task";

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


describe("taskTypeClasses", () => {
  it("returns distinct classes for each task type", () => {
    const classes = Object.values(TaskType).map(taskTypeClasses);
    expect(new Set(classes).size).toBe(classes.length);
  });

  it("is deterministic for the same type", () => {
    expect(taskTypeClasses(TaskType.BUG)).toBe(taskTypeClasses(TaskType.BUG));
  });
});

describe("taskPriorityStyle", () => {
  it("gives HIGHEST and HIGH the same urgent styling", () => {
    expect(taskPriorityStyle(TaskPriority.HIGHEST)).toEqual(
      taskPriorityStyle(TaskPriority.HIGH),
    );
  });

  it("returns a dotClass and textClass for every priority", () => {
    for (const priority of Object.values(TaskPriority)) {
      const style = taskPriorityStyle(priority);
      expect(style.dotClass).toBeTruthy();
      expect(style.textClass).toBeTruthy();
    }
  });

  it("falls back to LOW styling for an unrecognized priority", () => {
    const fallback = taskPriorityStyle("UNKNOWN" as TaskPriority);
    expect(fallback).toEqual(taskPriorityStyle(TaskPriority.LOW));
  });
});

describe("taskTypeVariant", () => {
  it("falls back to STORY's variant for an unrecognized type", () => {
    expect(taskTypeVariant("UNKNOWN" as TaskType)).toBe(taskTypeVariant(TaskType.STORY));
  });
});
