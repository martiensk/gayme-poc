export const dashboardThemes = [
  {
    id: 'fantasy',
    label: 'Fantasy',
    description: 'Parchment, gold, and ivy',
    icon: 'i-lucide-scroll-text'
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Neon glass and static',
    icon: 'i-lucide-binary'
  },
  {
    id: 'synthwave',
    label: 'Synthwave',
    description: 'Retro sunsets and chrome',
    icon: 'i-lucide-sun-medium'
  },
  {
    id: 'western',
    label: 'Western',
    description: 'Dust, leather, and brass',
    icon: 'i-lucide-cowboy-hat'
  },
  {
    id: 'paper-tabletop',
    label: 'Paper Tabletop',
    description: 'Notes, ink, and card stock',
    icon: 'i-lucide-notebook-pen'
  },
  {
    id: 'ancient',
    label: 'Ancient',
    description: 'Stone, bronze, and relics',
    icon: 'i-lucide-landmark'
  },
  {
    id: 'medieval',
    label: 'Medieval',
    description: 'Ironwork and cathedral light',
    icon: 'i-lucide-crown'
  },
  {
    id: 'horror',
    label: 'Horror',
    description: 'Blood, ash, and candle soot',
    icon: 'i-lucide-skull'
  },
  {
    id: 'lovecraftian',
    label: 'Lovecraftian',
    description: 'Abyssal ink and eldritch glow',
    icon: 'i-lucide-ghost'
  }
] as const

export type DashboardThemeId = typeof dashboardThemes[number]['id']

const defaultTheme: DashboardThemeId = 'fantasy'

const isDashboardThemeId = (value: string): value is DashboardThemeId => {
  return dashboardThemes.some(theme => theme.id === value)
}

export const useDashboardTheme = () => {
  const themeCookie = useCookie<string>('dashboard.theme', {
    default: () => defaultTheme,
    sameSite: 'lax'
  })

  watchEffect(() => {
    if (!isDashboardThemeId(themeCookie.value)) {
      themeCookie.value = defaultTheme
    }
  })

  const theme = computed<DashboardThemeId>({
    get: () => isDashboardThemeId(themeCookie.value) ? themeCookie.value : defaultTheme,
    set: (value) => {
      themeCookie.value = value
    }
  })

  const currentTheme = computed(() => {
    return dashboardThemes.find(option => option.id === theme.value) ?? dashboardThemes[0]
  })

  return {
    theme,
    currentTheme,
    themes: dashboardThemes
  }
}
