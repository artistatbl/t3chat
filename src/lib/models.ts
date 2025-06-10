// Define the available AI models
export type AIModel =
  | 'gpt-4o'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'gemini-1.5-pro'
  | 'Gemini 2.5 Flash'
  | 'llama-3-70b'
  | 'claude-3-haiku'
  | 'mistral-large'
  | 'gpt-4-turbo'
  | 'llama-3-8b'
  | 'command-r-plus';

export type ModelConfig = {
  provider: 'openai' | 'google' | 'openrouter';
  modelId: string;
  name: string;
  description: string;
  headerKey: string;
};

type ModelsConfig = {
  [key in AIModel]: ModelConfig;
};

// Configuration for the top 10 AI models
export const MODELS_CONFIG: ModelsConfig = {
  'Gemini 2.5 Flash': {
    provider: 'google',
    modelId: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Fast and efficient Google model',
    headerKey: 'x-google-api-key',
  },
  'gpt-4o': {
    provider: 'openai',
    modelId: 'gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI\'s most advanced multimodal model',
    headerKey: 'x-openai-api-key',
  },
  'claude-3-opus': {
    provider: 'openrouter',
    modelId: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Anthropic\'s most powerful model',
    headerKey: 'x-openrouter-api-key',
  },
  'claude-3-sonnet': {
    provider: 'openrouter',
    modelId: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: 'Balanced performance and cost',
    headerKey: 'x-openrouter-api-key',
  },
  'gemini-1.5-pro': {
    provider: 'google',
    modelId: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Google\'s advanced multimodal model',
    headerKey: 'x-google-api-key',
  },
  'llama-3-70b': {
    provider: 'openrouter',
    modelId: 'meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B',
    description: 'Meta\'s largest open model',
    headerKey: 'x-openrouter-api-key',
  },
  'claude-3-haiku': {
    provider: 'openrouter',
    modelId: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fast and efficient model',
    headerKey: 'x-openrouter-api-key',
  },
  'mistral-large': {
    provider: 'openrouter',
    modelId: 'mistralai/mistral-large',
    name: 'Mistral Large',
    description: 'Powerful model from Mistral AI',
    headerKey: 'x-openrouter-api-key',
  },
  'gpt-4-turbo': {
    provider: 'openai',
    modelId: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Fast and capable OpenAI model',
    headerKey: 'x-openai-api-key',
  },
  'llama-3-8b': {
    provider: 'openrouter',
    modelId: 'meta-llama/llama-3-8b-instruct',
    name: 'Llama 3 8B',
    description: 'Smaller, efficient Meta model',
    headerKey: 'x-openrouter-api-key',
  },
  'command-r-plus': {
    provider: 'openrouter',
    modelId: 'cohere/command-r-plus',
    name: 'Command R+',
    description: 'Specialized for reasoning tasks',
    headerKey: 'x-openrouter-api-key',
  },
};

// Helper function to get model configuration
export function getModelConfig(model: AIModel): ModelConfig {
  return MODELS_CONFIG[model];
}

// Get all available models for UI display
export function getAvailableModels() {
  return Object.entries(MODELS_CONFIG).map(([id, config]) => ({
    id: id as AIModel,
    name: config.name,
    description: config.description,
    provider: config.provider,
  }));
}