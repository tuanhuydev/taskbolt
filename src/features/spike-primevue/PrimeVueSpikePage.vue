<template>
  <div class="p-4 space-y-4">
    <div
      class="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <strong>Spike prototype</strong> — not linked from navigation, not part
      of the shipped app. Evaluating PrimeVue integration cost. See
      <code>docs/spikes/primevue-evaluation.md</code> for the full write-up.
    </div>

    <h1 class="text-xl font-semibold text-foreground">
      PrimeVue DataTable prototype
    </h1>
    <p class="text-sm text-muted-foreground">
      Sample task rows rendered with PrimeVue's DataTable (sortable columns,
      built-in pagination) — the kind of component that's expensive to
      hand-build on top of the current reka-ui primitives.
    </p>

    <DataTable
      :value="sampleTasks"
      paginator
      :rows="5"
      sort-mode="single"
      removable-sort
      class="rounded-lg border border-border overflow-hidden text-sm"
    >
      <Column field="id" header="ID" sortable style="width: 8rem" />
      <Column field="title" header="Title" sortable />
      <Column field="type" header="Type" sortable style="width: 8rem" />
      <Column field="status" header="Status" sortable style="width: 10rem" />
      <Column field="priority" header="Priority" sortable style="width: 8rem" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";

// Static sample data — this page exists purely to exercise the component,
// not to hit the real task API.
const sampleTasks = [
  { id: "CHK-233", title: "Order summary redesign", type: "Story", status: "In Progress", priority: "High" },
  { id: "CHK-230", title: "Fix cart total rounding", type: "Bug", status: "Done", priority: "Medium" },
  { id: "CHK-248", title: "Checkout flagged as blocked", type: "Issue", status: "Blocked", priority: "Highest" },
  { id: "CHK-239", title: "Add shipping estimate", type: "Story", status: "To Do", priority: "Low" },
  { id: "CHK-252", title: "Update payment estimate", type: "Story", status: "In Progress", priority: "Medium" },
  { id: "CHK-255", title: "Backlog grooming pass", type: "Epic", status: "To Do", priority: "Medium" },
];
</script>
