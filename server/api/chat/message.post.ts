import type { H3Event } from 'h3'
import { createError } from 'h3'
import { CHAT_PROVIDERS, type TChatProvider } from '../../../shared/chat'
import { resolveProvider } from '../../utils/chat/providers'
import type { IChatHistoryMessage, TChatRole } from '../../utils/chat/types'

interface IChatPart {
  type: 'text'
  text: string
}

interface IChatMessage {
  role: TChatRole
  content?: string
  parts?: IChatPart[]
}

interface IChatMessageRequestBody {
  message?: string
  chatId?: string
  provider?: TChatProvider
  messages?: IChatMessage[]
}

const isChatRole = (role: unknown): role is TChatRole => {
  return role === 'user' || role === 'assistant' || role === 'system'
}

const toMessageContent = (message: IChatMessage): string => {
  if (typeof message.content === 'string') {
    return message.content
  }

  if (!Array.isArray(message.parts)) {
    return ''
  }

  return message.parts
    .filter(part => part.type === 'text' && typeof part.text === 'string')
    .map(part => part.text)
    .join('')
}

const normalizeHistory = (messages: IChatMessage[] | undefined): IChatHistoryMessage[] => {
  if (!Array.isArray(messages)) {
    return []
  }

  return messages
    .map((message) => ({
      role: message.role,
      content: toMessageContent(message).trim()
    }))
    .filter(message => isChatRole(message.role) && message.content.length > 0)
}

const getMessageFromBody = (body: IChatMessageRequestBody, history: IChatHistoryMessage[]): string => {
  if (typeof body.message === 'string' && body.message.trim().length > 0) {
    return body.message.trim()
  }

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index]

    if (!item) {
      continue
    }

    if (item.role === 'user') {
      return item.content
    }
  }

  return ''
}

const getProvider = (provider: unknown, fallback: TChatProvider): TChatProvider => {
  if (typeof provider === 'string' && CHAT_PROVIDERS.includes(provider as TChatProvider)) {
    return provider as TChatProvider
  }

  return fallback
}

const normalizeIdentifier = (value: string, fallback: string): string => {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9:_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)

  return normalized.length > 0 ? normalized : fallback
}

const resolveUserId = (event: H3Event): string => {
  const context = event.context as Record<string, unknown>
  const user = context.user

  if (user && typeof user === 'object') {
    const userRecord = user as Record<string, unknown>
    if (typeof userRecord.id === 'string') {
      return normalizeIdentifier(userRecord.id, 'anonymous')
    }
  }

  return 'anonymous'
}

export default defineEventHandler(async (event) => {
  const body = (await readBody<IChatMessageRequestBody>(event)) ?? {}
  const runtimeConfig = useRuntimeConfig(event)
  const history = normalizeHistory(body.messages)
  const message = getMessageFromBody(body, history)

  if (!message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A non-empty message is required.'
    })
  }

  const defaultProvider = getProvider(runtimeConfig.chat.defaultProvider, 'qwen3')
  const provider = getProvider(body.provider, defaultProvider)
  const chatId = normalizeIdentifier(body.chatId ?? '', 'default')
  const userId = resolveUserId(event)

  try {
    const chatProvider = resolveProvider(provider)
    const result = await chatProvider.sendMessage(event, {
      message,
      chatId,
      userId,
      history
    })

    return {
      reply: result.reply,
      provider
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to complete chat request right now.'
    })
  }
})
