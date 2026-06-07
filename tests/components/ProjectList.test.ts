import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import ProjectList from '@/features/configure/ProjectList.vue';
import { mockApiClient, mockShellServices } from '../mocks/shell-services';
import { ProjectStatus, ProjectType, type Project } from '@/shared/types/project';
import { SHELL_SERVICES_KEY } from '@/shared/composables/useShellServices';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/configure', name: 'configure', component: { template: '<div />' } },
    {
      path: '/configure/projects/:projectId',
      name: 'project-detail',
      component: { template: '<div />' },
    },
  ],
});

const mockProject: Project = {
  id: 'proj-1',
  name: 'Alpha Project',
  clientName: 'ACME Corp',
  description: 'A test project',
  users: [],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  status: ProjectStatus.ACTIVE,
  type: ProjectType.INTERNAL,
  createdById: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
};

function mountComponent() {
  return mount(ProjectList, {
    global: {
      plugins: [router],
      provide: { [SHELL_SERVICES_KEY as symbol]: mockShellServices },
    },
  });
}

describe('ProjectList', () => {
  it('shows loading state initially', () => {
    vi.mocked(mockApiClient.request).mockReturnValue(new Promise(() => {}));
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('common.loading');
  });

  it('renders project list after loading', async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ projects: [mockProject], total: 1 }),
    } as Response);

    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0)); // flush promises
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Alpha Project');
    expect(wrapper.text()).toContain('ACME Corp');
  });

  it('shows empty message when no projects', async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ projects: [], total: 0 }),
    } as Response);

    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('configure.noProjects');
  });

  it('shows error message on API failure', async () => {
    vi.mocked(mockApiClient.request).mockRejectedValueOnce(
      new Error('Network error'),
    );

    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Network error');
  });

  it('navigates to project-detail on row click', async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ projects: [mockProject], total: 1 }),
    } as Response);

    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const pushSpy = vi.spyOn(router, 'push');
    const row = wrapper.find('li');
    await row.trigger('click');

    expect(pushSpy).toHaveBeenCalledWith({
      name: 'project-detail',
      params: { projectId: 'proj-1' },
    });
  });
});
