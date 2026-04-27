import { LLMConfig, ChatMessageInput, LLMProvider } from '../types';
import { LLM_PROVIDERS } from '../types';

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
    const headers = this.getHeaders();
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
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
    const headers = this.getHeaders();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
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
  
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // 本地模型可能不需要API密钥
    if (this.config?.apiKey && !this.isLocalProvider()) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    
    return headers;
  }
  
  private isLocalProvider(): boolean {
    const provider = this.config?.provider;
    return provider === 'ollama' || provider === 'lmstudio' || provider === 'llamacpp';
  }
  
  private getEndpoint(): string {
    if (this.config?.endpoint) {
      return this.config.endpoint;
    }
    
    const providerInfo = LLM_PROVIDERS.find(p => p.id === this.config?.provider);
    return providerInfo?.defaultEndpoint || '';
  }
  
  getProviderInfo(providerId: LLMProvider) {
    return LLM_PROVIDERS.find(p => p.id === providerId);
  }
  
  getAllProviders() {
    return LLM_PROVIDERS;
  }
  
  getCloudProviders() {
    return LLM_PROVIDERS.filter(p => !p.isLocal);
  }
  
  getLocalProviders() {
    return LLM_PROVIDERS.filter(p => p.isLocal);
  }
}

export const llmService = new LLMService();
