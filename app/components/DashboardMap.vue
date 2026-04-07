<script setup lang="ts">
const mapLocations = [
  { id: 1, name: 'San Francisco', coords: '37.7749° N, 122.4194° W' },
  { id: 2, name: 'New York', coords: '40.7128° N, 74.0060° W' },
  { id: 3, name: 'London', coords: '51.5074° N, 0.1278° W' },
  { id: 4, name: 'Tokyo', coords: '35.6762° N, 139.6503° E' }
]
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-950 dark:to-blue-900">
      <div class="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-white/50 dark:border-blue-700 dark:bg-black/20">
        <div class="text-center">
          <UIcon
            name="i-lucide-map"
            class="mx-auto mb-2 text-3xl text-blue-500"
          />
          <p class="text-sm font-medium text-muted">
            Map View
          </p>
          <p class="text-xs text-muted">
            Interactive map coming soon
          </p>
        </div>
      </div>
    </div>

    <div class="border-t border-default p-4">
      <p class="mb-3 text-sm font-medium">
        Locations
      </p>
      <div class="space-y-2">
        <div
          v-for="location in mapLocations"
          :key="location.id"
          class="flex items-center justify-between rounded-lg border border-default p-2 text-sm hover:bg-muted"
        >
          <span>
            {{ location.name }}
          </span>
          <span class="text-xs text-muted">
            {{ location.coords }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
