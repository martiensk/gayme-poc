<script setup lang="ts">
const { username } = useChatSettings()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-highlighted">
        Chat settings
      </h2>
      <p class="mt-1 text-sm text-muted">
        Set the name used when chatting with the AI.
      </p>
    </div>

    <div class="space-y-2">
      <label
        for="username"
        class="block text-sm font-medium text-highlighted"
      >
        Username
      </label>
      <UInput
        id="username"
        v-model="username"
        placeholder="anonymous"
        size="lg"
      />
    </div>
  </div>
</template>
