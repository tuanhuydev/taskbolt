<template>
  <aside class="w-50 border-r border-border bg-background flex flex-col">
    <!-- Navigation -->
    <nav class="flex-1 px-2 flex flex-col gap-1">
      <!-- Project Selector -->
      <div class="mb-3 h-14 flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              class="w-full justify-between text-sm font-normal"
              :disabled="isLoadingProjects"
            >
              {{ selectedProjectName }}
              <ChevronDown class="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-44">
            <DropdownMenuLabel>{{ t("sidebar.projects") }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem @click="selectProject(null)">
                {{ t("sidebar.personalWorkspace") }}
              </DropdownMenuItem>
              <DropdownMenuItem
                v-for="project in projects"
                :key="project.id"
                @click="selectProject(project.id)"
              >
                {{ project.name }}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Menu Items -->
      <a
        v-for="item in menuItems"
        :key="item.path"
        class="flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
        :class="
          isActive(item.path)
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground'
        "
        @click.prevent="navigate(item.path)"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        {{ t(item.labelKey) }}
      </a>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  ChevronDown,
  Zap,
  ListTodo,
  BarChart2,
  Settings,
} from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { useProjectContext } from "@/shared/composables/useProject";
import { useApiClient } from "@/shared/composables/useShellServices";
import type { Project } from "@/shared/types/project";
import { getProjects } from "@/shared/services";

const props = defineProps<{
  currentPath?: string;
}>();

const emit = defineEmits<{
  navigate: [path: string];
}>(); // path is a URL path e.g. "/active-sprint"

const { t } = useTaskboltTranslation();
const { selectedProjectId, setSelectedProjectId } = useProjectContext();
const apiClient = useApiClient();

const projects = ref<Project[]>([]);
const isLoadingProjects = ref(false);

const selectedProjectName = computed(() => {
  if (!selectedProjectId.value) {
    return t("sidebar.personalWorkspace");
  }
  const project = projects.value.find((p) => p.id === selectedProjectId.value);
  return project ? project.name : t("sidebar.personalWorkspace");
});

async function fetchProjects() {
  if (!apiClient) {
    console.error("ApiClient is not available");
    return;
  }
  
  isLoadingProjects.value = true;
  try {
    const projectList = await getProjects(apiClient);
    projects.value = projectList;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  } finally {
    isLoadingProjects.value = false;
  }
}

function selectProject(projectId: string | null) {
  setSelectedProjectId(projectId);
}

onMounted(() => {
  fetchProjects();
});

const menuItems = [
  {
    label: "Active Sprint",
    labelKey: "sidebar.activeSprint",
    path: "/active-sprint",
    icon: Zap,
  },
  {
    label: "Backlogs",
    labelKey: "sidebar.backlogs",
    path: "/backlogs",
    icon: ListTodo,
  },
  {
    label: "Reports",
    labelKey: "sidebar.reports",
    path: "/reports",
    icon: BarChart2,
  },
  {
    label: "Configure",
    labelKey: "sidebar.configure",
    path: "/configure",
    icon: Settings,
  },
];

function isActive(path: string): boolean {
  return props.currentPath === path;
}

function navigate(path: string): void {
  emit("navigate", path);
}
</script>
