<template>
	<aside class="w-48 border-r border-border bg-background flex flex-col">
		<!-- Navigation -->
		<nav class="flex-1 px-2 flex flex-col gap-1">
			<!-- Project Selector -->
			<div class="mb-3 h-14 flex items-center">
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button
							variant="outline"
							class="w-full justify-between text-sm font-normal"
						>
							{{ selectedProject || t("sidebar.selectProject") }}
							<ChevronDown class="h-4 w-4 opacity-50" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent class="w-44">
						<DropdownMenuLabel>{{ t("sidebar.projects") }}</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								v-for="project in projects"
								:key="project.value"
								@click="selectedProject = project.value"
							>
								{{ project.label }}
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<!-- Menu Items -->
			<a
				v-for="item in menuItems"
				:key="item.routeName"
				class="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
				:class="
					isActive(item.routeName)
						? 'bg-primary text-primary-foreground font-medium'
						: 'text-muted-foreground'
				"
				@click.prevent="navigate(item.routeName)"
			>
				<component :is="item.icon" class="h-4 w-4 shrink-0" />
				{{ t(item.labelKey) }}
			</a>
		</nav>
	</aside>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTaskboltTranslation } from "@/composables/useShellServices";

const props = defineProps<{
	currentPath?: string;
}>();

const emit = defineEmits<{
	navigate: [path: string];
}>();

const { t } = useTaskboltTranslation();

const selectedProject = ref("personal");

const projects = [
	{ value: "PROJ-001", label: "PROJ-001" },
	{ value: "PROJ-002", label: "PROJ-002" },
	{ value: "personal", label: "Personal workspace" },
];

const menuItems = [
	{
		label: "Active Sprint",
		labelKey: "sidebar.activeSprint",
		routeName: "active-sprint",
		icon: Zap,
	},
	{
		label: "Backlogs",
		labelKey: "sidebar.backlogs",
		routeName: "backlogs",
		icon: ListTodo,
	},
	{
		label: "Reports",
		labelKey: "sidebar.reports",
		routeName: "reports",
		icon: BarChart2,
	},
	{
		label: "Configure",
		labelKey: "sidebar.configure",
		routeName: "configure",
		icon: Settings,
	},
];

function isActive(routeName: string): boolean {
	return props.currentPath === routeName;
}

function navigate(routeName: string): void {
	emit("navigate", routeName);
}
</script>
