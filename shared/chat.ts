export const CHAT_PROVIDERS = ['qwen3', 'openclaw'] as const

export type TChatProvider = (typeof CHAT_PROVIDERS)[number]
