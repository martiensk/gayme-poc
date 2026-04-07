<script setup lang="ts">
import type { PanelType } from '~/composables/useDashboardPanels'

interface Props {
  panelId: PanelType
  title: string
  closable?: boolean
  floatingOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  floatingOnly: false
})

const emit = defineEmits<{
  close: []
  floatingChange: [isFloating: boolean]
}>()

const { state, raise, setFloating, toggleFloating, toggleCollapsed, setPosition, setSize, clampToViewport } = usePanelWindow(props.panelId)

const { startDrag, startResize } = usePanelDragResize({
  getWindow: () => state.value,
  setPosition,
  setSize,
  raise
})

const floatingStyle = computed(() => ({
  top: `${state.value.y}px`,
  left: `${state.value.x}px`,
  width: `${state.value.width}px`,
  height: `${state.value.height}px`,
  zIndex: state.value.zIndex
}))

const onClose = () => {
  if (state.value.isFloating) {
    setFloating(false)
  }

  emit('close')
}

const onToggleFloating = () => {
  toggleFloating()
  emit('floatingChange', state.value.isFloating)
}

const onToggleCollapsed = () => {
  toggleCollapsed()
}

const onHeaderPointerDown = (event: PointerEvent) => {
  if ((event.target as HTMLElement)?.closest('[data-panel-control]')) {
    return
  }

  startDrag(event)
}

const onResizePointerDown = (event: PointerEvent) => {
  startResize(event)
}

onMounted(() => {
  if (!import.meta.client) {
    return
  }

  const onViewportResize = () => {
    clampToViewport()
  }

  window.addEventListener('resize', onViewportResize)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', onViewportResize)
  })
})
</script>

<template>
  <div
    v-if="!state.isFloating && !floatingOnly"
    class="panel-shell"
  >
    <header class="panel-shell__header">
      <div class="panel-shell__title-wrap">
        <span class="panel-shell__title">{{ title }}</span>
      </div>

      <div class="panel-shell__controls">
        <UButton
          data-panel-control
          icon="i-lucide-external-link"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Pop out panel"
          @click="onToggleFloating"
        />

        <UButton
          v-if="closable"
          data-panel-control
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Close panel"
          @click="onClose"
        />
      </div>
    </header>

    <div class="panel-shell__content">
      <slot />
    </div>
  </div>

  <Teleport
    v-else
    to="body"
  >
    <section
      class="panel-float"
      :style="floatingStyle"
      @pointerdown="raise"
    >
      <header
        class="panel-float__header"
        @pointerdown="onHeaderPointerDown"
      >
        <div class="panel-float__title-wrap">
          <span class="panel-float__title">{{ title }}</span>
        </div>

        <div class="panel-float__controls">
          <UButton
            data-panel-control
            :icon="state.isCollapsed ? 'i-lucide-chevrons-down-up' : 'i-lucide-chevrons-up-down'"
            color="neutral"
            variant="ghost"
            size="xs"
            :aria-label="state.isCollapsed ? 'Expand panel' : 'Collapse panel'"
            @click="onToggleCollapsed"
          />
          <UButton
            data-panel-control
            icon="i-lucide-panel-bottom-close"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Dock panel"
            @click="onToggleFloating"
          />
          <UButton
            v-if="closable"
            data-panel-control
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Close panel"
            @click="onClose"
          />
        </div>
      </header>

      <div
        v-show="!state.isCollapsed"
        class="panel-float__content"
      >
        <slot />
      </div>

      <button
        v-if="!state.isCollapsed"
        class="panel-float__resize"
        type="button"
        aria-label="Resize panel"
        @pointerdown.prevent="onResizePointerDown"
      />
    </section>
  </Teleport>
</template>
