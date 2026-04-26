export * from './novel';
export * from './character';
export * from './story';

export interface LLMConfig {
  provider: 'groq' | 'deepseek' | 'openai';
  apiKey: string;
  endpoint?: string;
  modelName: string;
}

export interface ChatMessageInput {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
