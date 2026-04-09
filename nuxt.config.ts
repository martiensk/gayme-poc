// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    chat: {
      defaultProvider: process.env.CHAT_PROVIDER ?? 'qwen3'
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL ?? 'qwen3:14b'
    },
    openclaw: {
      gatewayUrl: process.env.OPENCLAW_GATEWAY_URL ?? '',
      gatewayToken: process.env.OPENCLAW_GATEWAY_TOKEN ?? '',
      agentId: process.env.OPENCLAW_AGENT_ID ?? 'ttrpg-gm',
      model: process.env.OPENCLAW_MODEL ?? 'openclaw/ttrpg-gm',
      messageChannel: process.env.OPENCLAW_MESSAGE_CHANNEL ?? 'webapp-chat'
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
