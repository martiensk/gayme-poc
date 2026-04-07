<script setup lang="ts">
const rows = [
  { id: 1, name: 'Item A', value: 100, status: 'Active' },
  { id: 2, name: 'Item B', value: 250, status: 'Active' },
  { id: 3, name: 'Item C', value: 75, status: 'Inactive' },
  { id: 4, name: 'Item D', value: 180, status: 'Pending' }
]
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex-1 overflow-auto p-4">
      <table class="w-full text-sm">
        <thead class="border-b border-default">
          <tr>
            <th class="pb-2 text-left font-medium">
              Name
            </th>
            <th class="pb-2 text-left font-medium">
              Value
            </th>
            <th class="pb-2 text-left font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.id"
            class="border-b border-default hover:bg-muted/50"
          >
            <td class="py-3">
              {{ row.name }}
            </td>
            <td class="py-3">
              ${{ row.value }}
            </td>
            <td class="py-3">
              <UBadge
                :label="row.status"
                :color="
                  row.status === 'Active'
                    ? 'success'
                    : row.status === 'Pending'
                      ? 'warning'
                      : 'neutral'
                "
                variant="subtle"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="border-t border-default p-4">
      <UButton
        icon="i-lucide-plus"
        label="Add Row"
        class="w-full"
      />
    </div>
  </div>
</template>
