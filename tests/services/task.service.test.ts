import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, getTaskById, createTask, updateTask } from '@/shared/services/task.service';
import { mockApiClient } from '../mocks/shell-services';
import { TaskType, TaskStatus, TaskPriority, type Task } from '@/shared/types/task';

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'A test task',
  type: TaskType.ISSUE,
  priority: TaskPriority.MEDIUM,
  storyPoint: 3,
  assigneeId: null,
  parentId: null,
  status: TaskStatus.TODO,
  createdById: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
  projectId: 'proj-1',
  subTasks: [],
  sprintId: null,
};

describe('task.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasks', () => {
    it('returns list of tasks on success', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: [mockTask], total: 1 }),
      } as Response);

      const result = await getTasks(mockApiClient);
      expect(result).toEqual([mockTask]);
    });

    it('throws on non-ok response', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(getTasks(mockApiClient)).rejects.toThrow('Failed to fetch tasks (500)');
    });

    it('appends query params when filter is provided', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: [], total: 0 }),
      } as Response);

      await getTasks(mockApiClient, { status: TaskStatus.TODO });

      expect(mockApiClient.request).toHaveBeenCalledWith(
        expect.stringContaining(`status=${TaskStatus.TODO}`),
        expect.any(Object),
      );
    });
  });

  describe('getTaskById', () => {
    it('returns task on success', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      } as Response);

      const result = await getTaskById(mockApiClient, 'task-1');
      expect(result).toEqual(mockTask);
    });

    it('throws on non-ok response', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(getTaskById(mockApiClient, 'task-999')).rejects.toThrow(
        'Failed to fetch task (404)',
      );
    });
  });

  describe('createTask', () => {
    it('sends POST request and returns the created task', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      } as Response);

      const payload = {
        title: 'Test Task',
        type: TaskType.ISSUE,
        projectId: 'proj-1',
      };
      const result = await createTask(mockApiClient, payload);

      expect(result).toEqual(mockTask);
      expect(mockApiClient.request).toHaveBeenCalledWith(
        expect.stringContaining('/tasks'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      );
    });

    it('throws on non-ok response', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response);

      await expect(
        createTask(mockApiClient, { title: '', type: TaskType.ISSUE }),
      ).rejects.toThrow('Failed to create task (400)');
    });
  });

  describe('updateTask', () => {
    it('sends PATCH request and returns the updated task', async () => {
      const updated = { ...mockTask, title: 'Updated Title' };
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: true,
        json: async () => updated,
      } as Response);

      const result = await updateTask(mockApiClient, 'task-1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
      expect(mockApiClient.request).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/task-1'),
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    it('throws on non-ok response', async () => {
      vi.mocked(mockApiClient.request).mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response);

      await expect(
        updateTask(mockApiClient, 'task-1', { title: '' }),
      ).rejects.toThrow('Failed to update task (400)');
    });
  });
});
