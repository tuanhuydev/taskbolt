<template>
	<div>
		<h2 class="text-2xl font-semibold mb-6">Backlogs</h2>

		<p v-if="loading" class="text-muted-foreground">Loading tasks…</p>
		<p v-else-if="error" class="text-destructive">{{ error }}</p>

		<ul v-else class="flex flex-col gap-2">
			<li
				v-for="task in tasks"
				:key="task.id"
				class="border border-border rounded-md px-4 py-3 bg-card text-card-foreground"
			>
				<span class="font-medium">{{ task.title }}</span>
				<span v-if="task.status" class="ml-2 text-xs text-muted-foreground">
					{{ task.status }}
				</span>
			</li>
			<li v-if="tasks.length === 0" class="text-muted-foreground">
				No tasks found.
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useShellServices } from "@/composables/useShellServices";
import { AUTH_URL } from "@/lib/constants";

interface Task {
	id: string | number;
	title: string;
	status?: string;
	[key: string]: unknown;
}

const { getApiClient } = useShellServices();

const tasks = ref<Task[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
	const apiClient = getApiClient();

	if (!apiClient) {
		error.value = "API client not available from shell.";
		loading.value = false;
		return;
	}

	try {
		const response = await apiClient.request(`${AUTH_URL}/tasks`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch tasks (${response.status})`);
		}

		tasks.value = await response.json();
	} catch (err: any) {
		error.value = err.message || "Failed to load tasks.";
	} finally {
		loading.value = false;
	}
});
</script>
