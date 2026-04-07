<script setup lang="ts">
import type { Component } from 'vue'
import type { PanelType } from '~/composables/useDashboardPanels'
import DashboardChat from '~/components/DashboardChat.vue'
import DashboardMap from '~/components/DashboardMap.vue'
import DashboardJournal from '~/components/DashboardJournal.vue'
import DashboardSheet from '~/components/DashboardSheet.vue'

const { primaryPanel, secondaryPanel, togglePanel, clearSecondary, setSecondaryPanel } = useDashboardPanels()

const mapWindow = usePanelWindow('map')
const journalWindow = usePanelWindow('journal')
const sheetWindow = usePanelWindow('sheet')

const panelWindows = {
  map: mapWindow,
  journal: journalWindow,
  sheet: sheetWindow
}

const floatablePanels: Array<Exclude<PanelType, 'chat'>> = ['map', 'journal', 'sheet']

const panelConfigs = [
  { id: 'chat', label: 'Chat', icon: 'i-lucide-message-circle' },
  { id: 'map', label: 'Map', icon: 'i-lucide-map' },
  { id: 'journal', label: 'Journal', icon: 'i-lucide-book-open' },
  { id: 'sheet', label: 'Sheet', icon: 'i-lucide-table-2' }
]

const panelLabels: Record<PanelType, string> = {
  chat: 'Chat',
  map: 'Map',
  journal: 'Journal',
  sheet: 'Sheet'
}

const getPanelLabel = (panel: PanelType) => panelLabels[panel]

const isFloatablePanel = (panel: PanelType): panel is Exclude<PanelType, 'chat'> => panel !== 'chat'

const isPanelFloating = (panel: PanelType) => {
  if (!isFloatablePanel(panel)) {
    return false
  }

  return panelWindows[panel].state.value.isFloating
}

const isPanelActive = (panel: PanelType) => {
  return primaryPanel.value === panel || secondaryPanel.value === panel || isPanelFloating(panel)
}

const panelComponents: Record<PanelType, Component> = {
  chat: DashboardChat,
  map: DashboardMap,
  journal: DashboardJournal,
  sheet: DashboardSheet
}

const getPanelComponent = (panelType: PanelType) => panelComponents[panelType]

const inlineSecondaryPanel = computed<Exclude<PanelType, 'chat'> | null>(() => {
  if (secondaryPanel.value === null || !isFloatablePanel(secondaryPanel.value)) {
    return null
  }

  if (isPanelFloating(secondaryPanel.value)) {
    return null
  }

  return secondaryPanel.value
})

const floatingPanels = computed(() => {
  return floatablePanels.filter(panel => panelWindows[panel].state.value.isFloating)
})

const hasTwoPanels = computed(() => inlineSecondaryPanel.value !== null)

const onPanelClick = (panel: PanelType) => {
  if (panel === 'chat') {
    clearSecondary()
    return
  }

  if (isPanelFloating(panel)) {
    panelWindows[panel].setFloating(false)
    setSecondaryPanel(panel)
    return
  }

  togglePanel(panel)
}

const onInlineFloatingChange = (isFloating: boolean) => {
  if (!isFloating) {
    return
  }

  clearSecondary()
}

const onFloatingPanelClose = (panel: Exclude<PanelType, 'chat'>) => {
  panelWindows[panel].setFloating(false)

  if (secondaryPanel.value === panel) {
    clearSecondary()
  }
}

const onFloatingPanelStateChange = (panel: Exclude<PanelType, 'chat'>, isFloating: boolean) => {
  if (isFloating) {
    return
  }

  setSecondaryPanel(panel)
}
</script>

<template>
  <div>
    <UDashboardGroup class="min-h-[70vh]">
      <UDashboardPanel id="main-panel">
        <template #header>
          <UDashboardNavbar title="Dashboard Panels">
            <template #right>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-bell"
                aria-label="Notifications"
              />
              <UAvatar
                alt="Admin"
                icon="i-lucide-user"
                size="sm"
              />
            </template>
          </UDashboardNavbar>

          <UDashboardToolbar>
            <template #left>
              <div class="flex gap-2">
                <UButton
                  v-for="config in panelConfigs"
                  :key="config.id"
                  :icon="config.icon"
                  :label="config.label"
                  :color="isPanelActive(config.id as PanelType) ? 'primary' : 'neutral'"
                  :variant="isPanelActive(config.id as PanelType) ? 'soft' : 'ghost'"
                  size="sm"
                  @click="onPanelClick(config.id as PanelType)"
                />
              </div>
            </template>

            <template #right>
              <UButton
                v-if="inlineSecondaryPanel"
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                aria-label="Close secondary panel"
                @click="clearSecondary"
              />
            </template>
          </UDashboardToolbar>
        </template>

        <template #body>
          <div
            :class="[
              'flex h-full gap-4 p-4',
              hasTwoPanels ? 'flex-row' : 'flex-col'
            ]"
          >
            <div :class="[hasTwoPanels ? 'flex-1' : 'h-full']">
              <div class="h-full overflow-hidden rounded-lg border border-default">
                <component
                  :is="getPanelComponent(primaryPanel)"
                  class="h-full"
                />
              </div>
            </div>

            <div
              v-if="inlineSecondaryPanel"
              class="flex-1"
            >
              <PanelWrapper
                :panel-id="inlineSecondaryPanel"
                :title="getPanelLabel(inlineSecondaryPanel)"
                :closable="true"
                @floating-change="onInlineFloatingChange"
                @close="clearSecondary"
              >
                <component
                  :is="getPanelComponent(inlineSecondaryPanel)"
                  class="h-full"
                />
              </PanelWrapper>
            </div>
          </div>
        </template>
      </UDashboardPanel>
    </UDashboardGroup>

    <PanelWrapper
      v-for="panel in floatingPanels"
      :key="`floating-${panel}`"
      :panel-id="panel"
      :title="getPanelLabel(panel)"
      :closable="true"
      :floating-only="true"
      @floating-change="(isFloating) => onFloatingPanelStateChange(panel, isFloating)"
      @close="onFloatingPanelClose(panel)"
    >
      <component
        :is="getPanelComponent(panel)"
        class="h-full"
      />
    </PanelWrapper>
  </div>
</template>
