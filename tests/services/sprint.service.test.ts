import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
} from "@/shared/services/sprint.service";
import { mockApiClient } from "../mocks/shell-services";
import { SprintStatus, type Sprint } from "@/shared/types/sprint";

const mockSprint: Sprint = {
  id: "sprint-1",
  name: "Sprint 1",
  projectId: "proj-1",
  status: SprintStatus.PLANNED,
  startDate: "2024-01-01",
  endDate: "2024-01-14",
  goal: "Deliver MVP",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("sprint.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSprints", () => {
    it("returns list of sprints", async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sprints: [mockSprint], total: 1 }),
      } as Response);

      const result = await getSprints(mockApiClient, { projectId: "proj-1" });
      expect(result).toEqual([mockSprint]);
    });

    it("throws on non-ok response", async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(getSprints(mockApiClient)).rejects.toThrow(
        "Failed to fetch sprints (500)",
      );
    });
  });

  describe("createSprint", () => {
    it("sends POST and returns created sprint", async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSprint,
      } as Response);

      const result = await createSprint(mockApiClient, {
        name: "Sprint 1",
        projectId: "proj-1",
      });
      expect(result).toEqual(mockSprint);
      expect(mockApiClient.request).toHaveBeenCalledWith(
        expect.stringContaining("/sprints"),
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("throws on non-ok response", async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: false,
        status: 422,
      } as Response);

      await expect(
        createSprint(mockApiClient, { name: "", projectId: "proj-1" }),
      ).rejects.toThrow("Failed to create sprint (422)");
    });
  });

  describe("updateSprint", () => {
    it("sends PATCH and returns updated sprint", async () => {
      const updated = {
        ...mockSprint,
        name: "Sprint 1 Updated",
        status: SprintStatus.ACTIVE,
      };
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => updated,
      } as Response);

      const result = await updateSprint(mockApiClient, "sprint-1", {
        name: "Sprint 1 Updated",
        status: SprintStatus.ACTIVE,
      });
      expect(result.status).toBe(SprintStatus.ACTIVE);
      expect(mockApiClient.request).toHaveBeenCalledWith(
        expect.stringContaining("/sprints/sprint-1"),
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  describe("deleteSprint", () => {
    it("sends DELETE request", async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
      } as Response);

      await deleteSprint(mockApiClient, "sprint-1");
      expect(mockApiClient.request).toHaveBeenCalledWith(
        expect.stringContaining("/sprints/sprint-1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("throws on non-ok response", async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(deleteSprint(mockApiClient, "sprint-99")).rejects.toThrow(
        "Failed to delete sprint (404)",
      );
    });
  });
});
