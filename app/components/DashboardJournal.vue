<script setup lang="ts">
const entries = [
  { id: 1, date: '2026-04-02', title: 'Project Kickoff', preview: 'Started working on the new dashboard...' },
  { id: 2, date: '2026-04-01', title: 'Planning Session', preview: 'Discussed requirements with the team...' },
  { id: 3, date: '2026-03-31', title: 'Design Review', preview: 'Reviewed the latest UI components...' }
]
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex-1 space-y-3 overflow-y-auto p-4">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="rounded-lg border border-default p-4 hover:bg-muted/50"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs text-muted">
              {{ entry.date }}
            </p>
            <p class="mt-1 font-medium">
              {{ entry.title }}
            </p>
            <p class="mt-2 text-sm text-muted">
              {{ entry.preview }}
            </p>
          </div>
          <UButton
            icon="i-lucide-arrow-right"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    </div>

    <div class="border-t border-default p-4">
      <UButton
        icon="i-lucide-plus"
        label="New Entry"
        class="w-full"
      />
    </div>
  </div>
</template>
