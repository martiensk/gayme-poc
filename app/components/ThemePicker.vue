<script setup lang="ts">
const { theme, themes, currentTheme } = useDashboardTheme()

const themeItems = computed(() => themes.map(option => ({
  ...option
})))
</script>

<template>
  <USelectMenu
    v-model="theme"
    :items="themeItems"
    value-key="id"
    label-key="label"
    :icon="currentTheme.icon"
    color="neutral"
    variant="subtle"
    size="sm"
    :search-input="false"
    :content="{ align: 'end' }"
    class="w-52"
    :ui="{ content: 'min-w-60' }"
  >
    <template #item-description="{ item }">
      <span class="text-xs text-muted">
        {{ item.description }}
      </span>
    </template>
  </USelectMenu>
</template>
