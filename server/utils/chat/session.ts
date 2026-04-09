interface IOpenClawSessionKeyInput {
  userId?: string
  chatId?: string
}

const normalizeSessionPart = (value: string, fallback: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)

  return normalized.length > 0 ? normalized : fallback
}

export const buildOpenClawSessionKey = ({ userId, chatId }: IOpenClawSessionKeyInput): string => {
  if (typeof userId === 'string' && userId.trim().length > 0) {
    return `app:user:${normalizeSessionPart(userId, 'anonymous')}`
  }

  return `app:chat:${normalizeSessionPart(chatId ?? '', 'default')}`
}
