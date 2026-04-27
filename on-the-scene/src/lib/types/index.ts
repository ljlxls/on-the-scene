export * from './novel';
export * from './character';
export * from './story';

export type LLMProvider = 
  | 'groq' 
  | 'deepseek' 
  | 'openai' 
  | 'zhipu'      // 智谱清言
  | 'siliconflow' // 硅基流动
  | 'ollama'     // Ollama本地
  | 'lmstudio'   // LM Studio本地
  | 'llamacpp';  // llama.cpp本地

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  endpoint?: string;
  modelName: string;
}

export interface ChatMessageInput {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderInfo {
  id: LLMProvider;
  name: string;
  description: string;
  defaultModel: string;
  defaultEndpoint: string;
  requiresApiKey: boolean;
  isLocal: boolean;
  models?: string[];
}

export const LLM_PROVIDERS: ProviderInfo[] = [
  {
    id: 'groq',
    name: 'Groq (推荐)',
    description: '免费、速度快、Llama模型',
    defaultModel: 'llama-3.3-70b-versatile',
    defaultEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    requiresApiKey: true,
    isLocal: false,
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: '新用户免费额度、国内访问稳定',
    defaultModel: 'deepseek-chat',
    defaultEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    requiresApiKey: true,
    isLocal: false,
    models: ['deepseek-chat', 'deepseek-coder']
  },
  {
    id: 'zhipu',
    name: '智谱清言 (GLM)',
    description: '国内大模型、免费额度大',
    defaultModel: 'glm-4-flash',
    defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    requiresApiKey: true,
    isLocal: false,
    models: ['glm-4-flash', 'glm-4', 'glm-4-plus', 'glm-3-turbo']
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    description: '多种开源模型、按量计费',
    defaultModel: 'Qwen/Qwen2.5-7B-Instruct',
    defaultEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    requiresApiKey: true,
    isLocal: false,
    models: [
      'Qwen/Qwen2.5-7B-Instruct',
      'Qwen/Qwen2.5-72B-Instruct',
      'deepseek-ai/DeepSeek-V2.5',
      'meta-llama/Meta-Llama-3.1-8B-Instruct'
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT系列模型',
    defaultModel: 'gpt-3.5-turbo',
    defaultEndpoint: 'https://api.openai.com/v1/chat/completions',
    requiresApiKey: true,
    isLocal: false,
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o']
  },
  {
    id: 'ollama',
    name: 'Ollama (本地)',
    description: '本地运行开源模型',
    defaultModel: 'llama3.2',
    defaultEndpoint: 'http://localhost:11434/v1/chat/completions',
    requiresApiKey: false,
    isLocal: true,
    models: ['llama3.2', 'llama3.1', 'qwen2.5', 'mistral', 'codellama']
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (本地)',
    description: '本地GUI运行模型',
    defaultModel: 'local-model',
    defaultEndpoint: 'http://localhost:1234/v1/chat/completions',
    requiresApiKey: false,
    isLocal: true,
    models: []
  },
  {
    id: 'llamacpp',
    name: 'llama.cpp (本地)',
    description: 'llama.cpp HTTP服务器',
    defaultModel: 'local-model',
    defaultEndpoint: 'http://localhost:8080/v1/chat/completions',
    requiresApiKey: false,
    isLocal: true,
    models: []
  }
];
