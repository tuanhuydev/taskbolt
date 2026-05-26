import { inject, provide, type InjectionKey, type Ref, ref } from "vue";

interface ProjectContext {
  selectedProjectId: Ref<string | null>;
  setSelectedProjectId: (projectId: string | null) => void;
}

const ProjectContextKey: InjectionKey<ProjectContext> =
  Symbol("ProjectContext");

/**
 * Provide project context (use in parent component like AppLayout)
 */
export function provideProjectContext() {
  const selectedProjectId = ref<string | null>(null);

  const setSelectedProjectId = (projectId: string | null) => {
    selectedProjectId.value = projectId;
  };

  const context: ProjectContext = {
    selectedProjectId,
    setSelectedProjectId,
  };

  provide(ProjectContextKey, context);

  return context;
}

/**
 * Inject project context (use in child components like AppSidebar)
 */
export function useProjectContext() {
  const context = inject(ProjectContextKey);

  if (!context) {
    throw new Error(
      "useProjectContext must be used within a component that provides ProjectContext",
    );
  }

  return context;
}
