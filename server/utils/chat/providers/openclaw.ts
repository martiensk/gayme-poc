import { createError } from 'h3'
import { buildOpenClawSessionKey } from '../session'
import type { IChatProviderAdapter } from '../types'

interface IOpenClawResponseContent {
  text?: string
}

interface IOpenClawResponseOutputItem {
  content?: Array<IOpenClawResponseContent | string>
  text?: string
}

interface IOpenClawResponse {
  output_text?: string
  output?: IOpenClawResponseOutputItem[]
}

const getOpenClawReplyText = (response: IOpenClawResponse): string => {
  if (typeof response.output_text === 'string' && response.output_text.trim().length > 0) {
    return response.output_text.trim()
  }

  if (!Array.isArray(response.output)) {
    return ''
  }

  const parts: string[] = []

  for (const item of response.output) {
    if (typeof item?.text === 'string' && item.text.trim().length > 0) {
      parts.push(item.text.trim())
    }

    if (!Array.isArray(item?.content)) {
      continue
    }

    for (const contentPart of item.content) {
      if (typeof contentPart === 'string' && contentPart.trim().length > 0) {
        parts.push(contentPart.trim())
        continue
      }

      if (contentPart && typeof contentPart === 'object' && 'text' in contentPart && typeof contentPart.text === 'string' && contentPart.text.trim().length > 0) {
        parts.push(contentPart.text.trim())
      }
    }
  }

  return parts.join('\n').trim()
}

export const openclawProvider: IChatProviderAdapter = {
  async sendMessage(event, input) {
    const runtimeConfig = useRuntimeConfig(event)
    const gatewayUrl = runtimeConfig.openclaw.gatewayUrl.trim()
    const gatewayToken = runtimeConfig.openclaw.gatewayToken.trim()

    if (!gatewayUrl || !gatewayToken) {
      throw createError({
        statusCode: 500,
        statusMessage: 'OpenClaw is not configured on the server.'
      })
    }

    const endpoint = `${gatewayUrl.replace(/\/$/, '')}/v1/responses`
    const sessionKey = buildOpenClawSessionKey({
      userId: input.userId,
      chatId: input.chatId
    })

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gatewayToken}`,
        'Content-Type': 'application/json',
        'x-openclaw-session-key': sessionKey,
        'x-openclaw-agent-id': runtimeConfig.openclaw.agentId || 'ttrpg-gm',
        'x-openclaw-message-channel': runtimeConfig.openclaw.messageChannel || 'webapp-chat'
      },
      body: JSON.stringify({
        model: runtimeConfig.openclaw.model || 'openclaw/ttrpg-gm',
        input: [
          {
            type: 'message',
            role: 'user',
            content: input.message
          }
        ]
      })
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status || 502,
        statusMessage: 'OpenClaw chat provider is currently unavailable.'
      })
    }

    const parsed = await response.json() as IOpenClawResponse
    const reply = getOpenClawReplyText(parsed)

    if (!reply) {
      throw createError({
        statusCode: 502,
        statusMessage: 'OpenClaw returned an empty response.'
      })
    }

    return { reply }
  }
}
