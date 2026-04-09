import type { H3Event } from 'h3'
import type { TChatProvider } from '../../../shared/chat'

export type TChatRole = 'user' | 'assistant' | 'system'

export interface IChatHistoryMessage {
  role: TChatRole
  content: string
}

export interface IChatProviderMessageInput {
  message: string
  chatId: string
  userId: string
  history: IChatHistoryMessage[]
}

export interface IChatProviderMessageResult {
  reply: string
}

export interface IChatProviderAdapter {
  sendMessage: (
    event: H3Event,
    input: IChatProviderMessageInput
  ) => Promise<IChatProviderMessageResult>
}

export type TChatProviderMap = Record<TChatProvider, IChatProviderAdapter>
