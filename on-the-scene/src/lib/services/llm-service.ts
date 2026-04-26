import { LLMConfig, ChatMessageInput } from '../types';

export class LLMService {
  private config: LLMConfig | null = null;
  
  setConfig(config: LLMConfig) {
    this.config = config;
  }
  
  getConfig(): LLMConfig | null {
    return this.config;
  }
  
  async chat(
    messages: ChatMessageInput[],
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<string> {
    if (!this.config) {
      throw new Error('LLM config not set. Please configure your API key in Settings.');
    }
    
    const endpoint = this.getEndpoint();
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages,
          max_tokens: options?.maxTokens || 2048,
          temperature: options?.temperature || 0.7
        })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`LLM API error: ${response.status} - ${JSON.stringify(error)}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to call LLM API');
    }
  }
  
  async *streamChat(
    messages: ChatMessageInput[],
    options?: { maxTokens?: number; temperature?: number }
  ): AsyncGenerator<string> {
    if (!this.config) {
      throw new Error('LLM config not set. Please configure your API key in Settings.');
    }
    
    const endpoint = this.getEndpoint();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages,
        max_tokens: options?.maxTokens || 2048,
        temperature: options?.temperature || 0.7,
        stream: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }
    
    const reader = response.body?.getReader();
    if (!reader) return;
    
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
      
      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
  
  private getEndpoint(): string {
    if (this.config?.endpoint) {
      return this.config.endpoint;
    }
    
    switch (this.config?.provider) {
      case 'groq':
        return 'https://api.groq.com/openai/v1/chat/completions';
      case 'deepseek':
        return 'https://api.deepseek.com/v1/chat/completions';
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions';
      default:
        throw new Error('Unknown provider');
    }
  }
  
  getDefaultModelName(provider: string): string {
    switch (provider) {
      case 'groq':
        return 'llama-3.3-70b-versatile';
      case 'deepseek':
        return 'deepseek-chat';
      case 'openai':
        return 'gpt-3.5-turbo';
      default:
        return '';
    }
  }
}

export const llmService = new LLMService();
