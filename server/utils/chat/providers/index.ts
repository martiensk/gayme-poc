import type { TChatProvider } from '../../../../shared/chat'
import type { TChatProviderMap } from '../types'
import { openclawProvider } from './openclaw'
import { qwen3Provider } from './qwen3'

const providers: TChatProviderMap = {
  qwen3: qwen3Provider,
  openclaw: openclawProvider
}

export const resolveProvider = (provider: TChatProvider) => providers[provider]
