<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="gap-1.5">
        <ListFilter class="h-4 w-4" />
        {{ t("backlogs.filters") }}
        <Badge v-if="activeCount" variant="info">{{ activeCount }}</Badge>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-64 p-3" align="start">
      <DropdownMenuLabel class="px-0 pb-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {{ t("backlogs.filterStatus") }}
      </DropdownMenuLabel>
      <div class="flex flex-col gap-1.5 mb-3">
        <label
          v-for="status in statusOptions"
          :key="status"
          class="flex items-center gap-2 text-sm cursor-pointer"
        >
          <Checkbox
            :model-value="statuses.includes(status)"
            @update:model-value="() => toggleStatus(status)"
          />
          {{ t(`taskStatus.${status}`) }}
        </label>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuLabel class="px-0 pt-3 pb-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {{ t("backlogs.filterPriority") }}
      </DropdownMenuLabel>
      <div class="flex flex-col gap-1.5">
        <label
          v-for="priority in priorityOptions"
          :key="priority"
          class="flex items-center gap-2 text-sm cursor-pointer"
        >
          <Checkbox
            :model-value="priorities.includes(priority)"
            @update:model-value="() => togglePriority(priority)"
          />
          {{ t(`taskPriority.${priority}`) }}
        </label>
      </div>

      <template v-if="activeCount">
        <DropdownMenuSeparator />
        <Button variant="ghost" size="sm" class="w-full mt-1" @click="clearAll">
          {{ t("backlogs.clearFilters") }}
        </Button>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ListFilter } from "lucide-vue-next";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import { TaskStatus, TaskPriority } from "@/shared/types/task";

const { statuses, priorities } = defineProps<{
  statuses: TaskStatus[];
  priorities: TaskPriority[];
}>();

const emit = defineEmits<{
  (e: "update:statuses", value: TaskStatus[]): void;
  (e: "update:priorities", value: TaskPriority[]): void;
}>();

const { t } = useTaskboltTranslation();

const statusOptions = Object.values(TaskStatus);
const priorityOptions = Object.values(TaskPriority);

const activeCount = computed(() => statuses.length + priorities.length);

function toggleStatus(status: TaskStatus) {
  const next = statuses.includes(status)
    ? statuses.filter((s) => s !== status)
    : [...statuses, status];
  emit("update:statuses", next);
}

function togglePriority(priority: TaskPriority) {
  const next = priorities.includes(priority)
    ? priorities.filter((p) => p !== priority)
    : [...priorities, priority];
  emit("update:priorities", next);
}

function clearAll() {
  emit("update:statuses", []);
  emit("update:priorities", []);
}
</script>
