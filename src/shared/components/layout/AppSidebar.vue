<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 w-56 bg-background flex flex-col shadow-lg transition-[transform,width] duration-300
           md:relative md:z-auto md:shadow md:translate-x-0 md:flex md:flex-none md:inset-y-auto md:h-auto md:rounded-lg"
    :class="[open ? 'translate-x-0' : '-translate-x-full', collapsed ? 'md:w-16' : 'md:w-56']"
  >
    <!-- Mobile close button -->
    <div class="flex items-center justify-between px-3 h-12 border-b border-border md:hidden">
      <span class="font-semibold text-sm text-foreground">Menu</span>
      <button
        class="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-accent transition-colors"
        @click="$emit('close')"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-2 flex flex-col gap-1 overflow-y-auto">
      <!-- Project selector + desktop collapse toggle, same row -->
      <div v-if="!collapsed" class="mb-3 h-12 flex items-center gap-1">
        <div class="flex-1 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                class="w-full justify-between text-sm font-normal"
                :disabled="isLoadingProjects"
              >
                <span class="truncate">{{ selectedProjectName }}</span>
                <ChevronDown class="h-4 w-4 opacity-50 flex-none" />
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
        <button
          class="hidden md:flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-accent transition-colors flex-none"
          :title="t('sidebar.collapse')"
          @click="toggle"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
      </div>
      <div v-else class="hidden md:flex justify-center pb-2">
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-accent transition-colors"
          :title="t('sidebar.expand')"
          @click="toggle"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <a
        v-for="item in menuItems"
        :key="item.name"
        class="flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
        :class="[
          isActive(item.name)
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground',
          collapsed ? 'md:w-8 md:h-8 md:mx-auto md:justify-center md:px-0 md:py-0' : '',
        ]"
        :title="t(item.labelKey)"
        @click.prevent="navigate(item.name)"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        <span v-if="!collapsed">{{ t(item.labelKey) }}</span>
      </a>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  House,
  Zap,
  ListTodo,
  BarChart2,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
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
import { useAutoCollapse } from "@/shared/composables/useAutoCollapse";
import type { Project } from "@/shared/types/project";
import { getProjects } from "@/shared/services";

const props = defineProps<{
  currentRouteName?: string;
  open?: boolean;
}>();

const emit = defineEmits<{
  navigate: [routeName: string];
  close: [];
}>();

const { t } = useTaskboltTranslation();
const { selectedProjectId, setSelectedProjectId } = useProjectContext();
const apiClient = useApiClient();
const { collapsed, toggle } = useAutoCollapse();

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
  { label: "Home",          labelKey: "sidebar.home",         name: "home",          icon: House },
  { label: "Active Sprint", labelKey: "sidebar.activeSprint", name: "active-sprint", icon: Zap },
  { label: "Backlogs",      labelKey: "sidebar.backlogs",     name: "backlogs",      icon: ListTodo },
  { label: "Reports",       labelKey: "sidebar.reports",      name: "reports",       icon: BarChart2 },
  { label: "Configure",     labelKey: "sidebar.configure",    name: "configure-home", icon: Settings },
];

function isActive(routeName: string): boolean {
  return props.currentRouteName === routeName;
}

function navigate(routeName: string): void {
  emit("navigate", routeName);
}
</script>
