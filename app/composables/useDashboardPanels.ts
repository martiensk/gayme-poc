export type PanelType = 'chat' | 'map' | 'journal' | 'sheet'

export const useDashboardPanels = () => {
  const primaryPanel = useState<PanelType>('dashboard.primary', () => 'chat')
  const secondaryPanel = useState<PanelType | null>('dashboard.secondary', () => null)

  const setPrimaryPanel = (panel: PanelType) => {
    void panel
    primaryPanel.value = 'chat'
  }

  const setSecondaryPanel = (panel: PanelType | null) => {
    secondaryPanel.value = panel
  }

  const togglePanel = (panel: PanelType) => {
    if (panel === 'chat') {
      clearSecondary()
      return
    }

    if (secondaryPanel.value === panel) {
      setSecondaryPanel(null)
      return
    }

    setSecondaryPanel(panel)
  }

  const clearSecondary = () => {
    setSecondaryPanel(null)
  }

  return {
    primaryPanel,
    secondaryPanel,
    setPrimaryPanel,
    setSecondaryPanel,
    togglePanel,
    clearSecondary
  }
}
