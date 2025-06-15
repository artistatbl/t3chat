export const PROVIDER_CONFIG = {
  google: {
    name: 'Google',
    placeholder: 'AIza...',
    createUrl: 'https://aistudio.google.com/apikey',
    models: ['Gemini 2.5 Flash', 'gemini-1.5-pro']
  },
  openai: {
    name: 'OpenAI',
    placeholder: 'sk-...',
    createUrl: 'https://platform.openai.com/api-keys',
    models: ['gpt-4o', 'gpt-4-turbo']
  },
  openrouter: {
    name: 'OpenRouter',
    placeholder: 'sk-or-...',
    createUrl: 'https://openrouter.ai/keys',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'llama-3-70b', 'llama-3-8b', 'mistral-large', 'command-r-plus']
  }
};

export type ProviderType = keyof typeof PROVIDER_CONFIG;