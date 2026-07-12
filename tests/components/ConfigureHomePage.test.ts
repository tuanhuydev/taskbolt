import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { ref } from 'vue';
import ConfigureHomePage from '@/features/configure/ConfigureHomePage.vue';
import { mockApiClient, mockShellServices } from '../mocks/shell-services';
import { SHELL_SERVICES_KEY } from '@/shared/composables/useShellServices';
import { ProjectContextKey } from '@/shared/composables/useProject';
import { ProjectStatus, ProjectType, type Project } from '@/shared/types/project';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/configure', name: 'configure', component: { template: '<div />' } },
    { path: '/configure/projects', name: 'project-list', component: { template: '<div />' } },
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
  status: ProjectStatus.GOING,
  type: ProjectType.PRODUCT,
  createdById: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
};

function mountComponent(selectedProjectId: string | null) {
  return mount(ConfigureHomePage, {
    global: {
      plugins: [router],
      provide: {
        [SHELL_SERVICES_KEY as symbol]: mockShellServices,
        [ProjectContextKey as symbol]: {
          selectedProjectId: ref(selectedProjectId),
          setSelectedProjectId: vi.fn(),
        },
      },
      stubs: {
        ProjectForm: true,
        SprintForm: true,
        MemberForm: true,
      },
    },
  });
}

function mockProjectScopedApi() {
  vi.mocked(mockApiClient.request).mockImplementation(async (input) => {
    const url = String(input);
    if (url.includes('/projects/')) return { ok: true, json: async () => mockProject } as Response;
    if (url.includes('/roles')) return { ok: true, json: async () => [] } as Response;
    if (url.includes('/users')) return { ok: true, json: async () => ({ users: [] }) } as Response;
    if (url.includes('/resource-grants')) return { ok: true, json: async () => [] } as Response;
    if (url.includes('/sprints')) return { ok: true, json: async () => ({ sprints: [], total: 0 }) } as Response;
    return { ok: true, json: async () => ({}) } as Response;
  });
}

describe('ConfigureHomePage', () => {
  it('prompts to select a project when none is selected', async () => {
    const wrapper = mountComponent(null);
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('taskbolt:configure.selectProjectPrompt');
    expect(wrapper.findComponent({ name: 'ProjectMemberManagement' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'SprintManagement' }).exists()).toBe(false);
  });

  it('renders the coming soon cards regardless of project selection', () => {
    const wrapper = mountComponent(null);
    expect(wrapper.text()).toContain('taskbolt:configure.boardsTitle');
    expect(wrapper.text()).toContain('taskbolt:configure.workflowTitle');
    expect(wrapper.text()).toContain('taskbolt:configure.notificationsTitle');
  });

  it('renders the full project detail (info, sprints, members) for the selected project', async () => {
    mockProjectScopedApi();

    const wrapper = mountComponent('proj-1');
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Alpha Project');
    expect(wrapper.text()).toContain('ACME Corp');

    const memberManagement = wrapper.findComponent({ name: 'ProjectMemberManagement' });
    expect(memberManagement.exists()).toBe(true);
    expect(memberManagement.props('projectId')).toBe('proj-1');

    const sprintManagement = wrapper.findComponent({ name: 'SprintManagement' });
    expect(sprintManagement.exists()).toBe(true);
    expect(sprintManagement.props('projectId')).toBe('proj-1');

    // Edit action becomes available once a project is loaded
    expect(wrapper.find('button[aria-label="taskbolt:common.edit"]').exists()).toBe(true);
  });
});
