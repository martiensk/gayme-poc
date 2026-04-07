interface DragBounds {
  minWidth: number
  minHeight: number
}

const DEFAULT_BOUNDS: DragBounds = {
  minWidth: 320,
  minHeight: 220
}

export const usePanelDragResize = (
  options: {
    getWindow: () => {
      x: number
      y: number
      width: number
      height: number
      isCollapsed: boolean
    }
    setPosition: (x: number, y: number) => void
    setSize: (width: number, height: number) => void
    raise: () => void
  },
  bounds: DragBounds = DEFAULT_BOUNDS
) => {
  const startDrag = (event: PointerEvent) => {
    if (!import.meta.client || event.button !== 0) {
      return
    }

    options.raise()

    const startX = event.clientX
    const startY = event.clientY
    const current = options.getWindow()
    const originX = current.x
    const originY = current.y

    const onMove = (moveEvent: PointerEvent) => {
      const nextX = originX + (moveEvent.clientX - startX)
      const nextY = originY + (moveEvent.clientY - startY)
      options.setPosition(nextX, nextY)
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const startResize = (event: PointerEvent) => {
    if (!import.meta.client || event.button !== 0) {
      return
    }

    options.raise()

    const startX = event.clientX
    const startY = event.clientY
    const current = options.getWindow()

    if (current.isCollapsed) {
      return
    }

    const startWidth = current.width
    const startHeight = current.height

    const onMove = (moveEvent: PointerEvent) => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const maxWidth = Math.max(bounds.minWidth, viewportWidth - current.x - 8)
      const maxHeight = Math.max(bounds.minHeight, viewportHeight - current.y - 8)
      const nextWidth = Math.min(maxWidth, Math.max(bounds.minWidth, startWidth + (moveEvent.clientX - startX)))
      const nextHeight = Math.min(maxHeight, Math.max(bounds.minHeight, startHeight + (moveEvent.clientY - startY)))

      options.setSize(nextWidth, nextHeight)
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return {
    startDrag,
    startResize
  }
}
