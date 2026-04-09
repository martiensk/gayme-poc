import { createError } from 'h3'
import type { IChatProviderAdapter, IChatHistoryMessage } from '../types'

interface IOllamaMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface IOllamaChatResponse {
  message?: {
    content?: string
  }
}

const toOllamaMessages = (history: IChatHistoryMessage[], message: string): IOllamaMessage[] => {
  const normalizedHistory = history
    .filter(item => (item.role === 'user' || item.role === 'assistant' || item.role === 'system') && item.content.trim().length > 0)
    .map(item => ({
      role: item.role,
      content: item.content
    }))

  if (normalizedHistory.length === 0) {
    return [{ role: 'user', content: message }]
  }

  return normalizedHistory
}

export const qwen3Provider: IChatProviderAdapter = {
  async sendMessage(event, input) {
    const runtimeConfig = useRuntimeConfig(event)
    const ollamaUrl = `${runtimeConfig.ollama.baseUrl}/api/chat`
    const messages = toOllamaMessages(input.history, input.message)

    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: runtimeConfig.ollama.model,
        messages,
        stream: false,
        think: false
      })
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status || 502,
        statusMessage: 'Qwen3 chat provider is currently unavailable.'
      })
    }

    const parsed = await response.json() as IOllamaChatResponse
    const reply = typeof parsed?.message?.content === 'string' ? parsed.message.content.trim() : ''

    if (!reply) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Qwen3 returned an empty response.'
      })
    }

    return { reply }
  }
}
