import type { PanelType } from './useDashboardPanels'

export interface PanelWindowState {
  isFloating: boolean
  isCollapsed: boolean
  x: number
  y: number
  width: number
  height: number
  lastHeight: number
  zIndex: number
}

const getInitialWindowState = (panelId: PanelType): PanelWindowState => {
  const offsets: Record<PanelType, { x: number, y: number }> = {
    chat: { x: 48, y: 48 },
    map: { x: 96, y: 96 },
    journal: { x: 144, y: 120 },
    sheet: { x: 192, y: 144 }
  }

  const offset = offsets[panelId]

  return {
    isFloating: false,
    isCollapsed: false,
    x: offset.x,
    y: offset.y,
    width: 560,
    height: 420,
    lastHeight: 420,
    zIndex: 60
  }
}

export const usePanelWindow = (panelId: PanelType) => {
  const state = useState<PanelWindowState>(`panel-window:${panelId}`, () => getInitialWindowState(panelId))
  const topZ = useState<number>('panel-window:top-z', () => 60)

  const raise = () => {
    topZ.value += 1
    state.value.zIndex = topZ.value
  }

  const clampToViewport = () => {
    if (!import.meta.client) {
      return
    }

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const width = Math.min(state.value.width, viewportWidth - 16)
    const height = Math.min(state.value.height, viewportHeight - 16)
    const maxX = Math.max(8, viewportWidth - width - 8)
    const maxY = Math.max(8, viewportHeight - height - 8)

    state.value.width = width
    state.value.height = height
    state.value.x = Math.min(Math.max(state.value.x, 8), maxX)
    state.value.y = Math.min(Math.max(state.value.y, 8), maxY)
  }

  const setFloating = (value: boolean) => {
    state.value.isFloating = value
    if (value) {
      state.value.isCollapsed = false
      raise()
      clampToViewport()
    }
  }

  const toggleFloating = () => {
    setFloating(!state.value.isFloating)
  }

  const toggleCollapsed = () => {
    if (!state.value.isCollapsed) {
      state.value.lastHeight = state.value.height
      state.value.height = 52
      state.value.isCollapsed = true
      return
    }

    state.value.height = Math.max(state.value.lastHeight, 220)
    state.value.isCollapsed = false
    clampToViewport()
  }

  const setPosition = (x: number, y: number) => {
    state.value.x = x
    state.value.y = y
    clampToViewport()
  }

  const setSize = (width: number, height: number) => {
    state.value.width = width
    state.value.height = height
    if (!state.value.isCollapsed) {
      state.value.lastHeight = height
    }
    clampToViewport()
  }

  return {
    state,
    raise,
    setFloating,
    toggleFloating,
    toggleCollapsed,
    setPosition,
    setSize,
    clampToViewport
  }
}
