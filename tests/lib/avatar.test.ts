import { describe, it, expect } from "vitest";
import { AVATAR_COLORS, getInitials, colorForKey } from "@/shared/lib/avatar";

describe("getInitials", () => {
  it("takes the first letter of the first two words, uppercased", () => {
    expect(getInitials("Jane Doe")).toBe("JD");
  });

  it("uses just one letter for a single-word name", () => {
    expect(getInitials("Cher")).toBe("C");
  });

  it("ignores extra words beyond the first two", () => {
    expect(getInitials("Mary Jane Watson")).toBe("MJ");
  });

  it("collapses repeated whitespace", () => {
    expect(getInitials("  Jane   Doe  ")).toBe("JD");
  });

  it("returns an empty string for an empty name", () => {
    expect(getInitials("")).toBe("");
  });
});

describe("colorForKey", () => {
  it("is deterministic for the same key", () => {
    expect(colorForKey("user-123")).toBe(colorForKey("user-123"));
  });

  it("always returns one of the defined avatar colors", () => {
    for (const key of ["a", "user-1", "Some Long Name", "🙂"]) {
      expect(AVATAR_COLORS).toContain(colorForKey(key));
    }
  });

  it("can distinguish different keys (not a constant function)", () => {
    const colors = new Set(["a", "b", "c", "d", "e", "f"].map(colorForKey));
    expect(colors.size).toBeGreaterThan(1);
  });
});
