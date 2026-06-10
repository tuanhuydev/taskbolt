import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjects, getProjectById, updateProject } from '@/shared/services/project.service';
import { mockApiClient } from '../mocks/shell-services';
import { ProjectStatus, ProjectType, type Project } from '@/shared/types/project';

const mockProject: Project = {
  id: 'proj-1',
  name: 'Test Project',
  clientName: 'Test Client',
  description: 'A test project',
  users: [],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  status: ProjectStatus.GOING,
  type: ProjectType.PRODUCT,
  createdById: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
};

describe('project.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjects', () => {
    it('returns list of projects on success', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: [mockProject], total: 1 }),
      } as Response);

      const result = await getProjects(mockApiClient);
      expect(result).toEqual([mockProject]);
    });

    it('throws on non-ok response', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(getProjects(mockApiClient)).rejects.toThrow(
        'Failed to fetch projects (500)',
      );
    });

    it('appends query params when filter is provided', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: [], total: 0 }),
      } as Response);

      await getProjects(mockApiClient, { status: ProjectStatus.GOING });

      expect(mockApiClient.request).toHaveBeenCalledWith(
        expect.stringContaining(`status=${ProjectStatus.GOING}`),
        expect.any(Object),
      );
    });
  });

  describe('getProjectById', () => {
    it('returns project on success', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      } as Response);

      const result = await getProjectById(mockApiClient, 'proj-1');
      expect(result).toEqual(mockProject);
    });

    it('throws on non-ok response', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(getProjectById(mockApiClient, 'proj-999')).rejects.toThrow(
        'Failed to fetch project (404)',
      );
    });
  });

  describe('updateProject', () => {
    it('sends PATCH request and returns updated project', async () => {
      const updated = { ...mockProject, name: 'Updated Name' };
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => updated,
      } as Response);

      const result = await updateProject(mockApiClient, 'proj-1', { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
      expect(mockApiClient.request).toHaveBeenCalledWith(
        expect.stringContaining('/projects/proj-1'),
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    it('throws on non-ok response', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response);

      await expect(
        updateProject(mockApiClient, 'proj-1', { name: '' }),
      ).rejects.toThrow('Failed to update project (400)');
    });
  });
});
