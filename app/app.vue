<script setup>
const { theme } = useDashboardTheme()

useHead(() => ({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    'lang': 'en',
    'data-theme': theme.value
  }
}))

const title = 'TTRPG GM Dashboard'
const description = 'A proof-of-concept GM dashboard with selectable genre themes, chat, map, journal, and sheet panels.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader title="GameMaster">
      <template #right>
        <ThemePicker />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
