const axios = require('axios');

class LLMService {
  constructor(config) {
    this.config = config;
    this.provider = config.provider || 'deepseek';
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
    this.model = config.model;
    this.maxTokens = config.maxTokens || 2048;
    this.temperature = config.temperature || 0.7;
  }

  async chat(messages, options = {}) {
    const provider = this.getProvider();
    return provider.chat(messages, options);
  }

  getProvider() {
    switch (this.provider.toLowerCase()) {
      case 'deepseek':
        return new DeepSeekProvider(this);
      case 'moonshot':
        return new MoonshotProvider(this);
      case 'zhipu':
        return new ZhipuProvider(this);
      case 'groq':
        return new GroqProvider(this);
      case 'openrouter':
        return new OpenRouterProvider(this);
      case 'openai':
        return new OpenAIProvider(this);
      default:
        throw new Error(`Unsupported LLM provider: ${this.provider}`);
    }
  }
}

class BaseProvider {
  constructor(service) {
    this.service = service;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.service.apiKey}`
    };
  }

  async makeRequest(url, payload) {
    try {
      const response = await axios.post(url, payload, {
        headers: this.getHeaders(),
        timeout: 60000
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`LLM API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}

class DeepSeekProvider extends BaseProvider {
  constructor(service) {
    super(service);
    this.endpoint = service.endpoint || 'https://api.deepseek.com/v1/chat/completions';
    this.model = service.model || 'deepseek-chat';
  }

  async chat(messages, options = {}) {
    const payload = {
      model: this.model,
      messages: messages,
      max_tokens: options.maxTokens || this.service.maxTokens,
      temperature: options.temperature || this.service.temperature,
      stream: false
    };
    
    const data = await this.makeRequest(this.endpoint, payload);
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  }
}

class MoonshotProvider extends BaseProvider {
  constructor(service) {
    super(service);
    this.endpoint = service.endpoint || 'https://api.moonshot.cn/v1/chat/completions';
    this.model = service.model || 'moonshot-v1-8k';
  }

  async chat(messages, options = {}) {
    const payload = {
      model: this.model,
      messages: messages,
      max_tokens: options.maxTokens || this.service.maxTokens,
      temperature: options.temperature || this.service.temperature
    };
    
    const data = await this.makeRequest(this.endpoint, payload);
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  }
}

class ZhipuProvider extends BaseProvider {
  constructor(service) {
    super(service);
    this.endpoint = service.endpoint || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    this.model = service.model || 'glm-4-flash';
  }

  async chat(messages, options = {}) {
    const payload = {
      model: this.model,
      messages: messages,
      max_tokens: options.maxTokens || this.service.maxTokens,
      temperature: options.temperature || this.service.temperature
    };
    
    const data = await this.makeRequest(this.endpoint, payload);
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  }
}

class GroqProvider extends BaseProvider {
  constructor(service) {
    super(service);
    this.endpoint = service.endpoint || 'https://api.groq.com/openai/v1/chat/completions';
    this.model = service.model || 'llama-3.3-70b-versatile';
  }

  async chat(messages, options = {}) {
    const payload = {
      model: this.model,
      messages: messages,
      max_tokens: options.maxTokens || this.service.maxTokens,
      temperature: options.temperature || this.service.temperature
    };
    
    const data = await this.makeRequest(this.endpoint, payload);
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  }
}

class OpenRouterProvider extends BaseProvider {
  constructor(service) {
    super(service);
    this.endpoint = service.endpoint || 'https://openrouter.ai/api/v1/chat/completions';
    this.model = service.model || 'deepseek/deepseek-chat:free';
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.service.apiKey}`,
      'HTTP-Referer': 'https://localhost:3000',
      'X-Title': 'AI Roleplay App'
    };
  }

  async chat(messages, options = {}) {
    const payload = {
      model: this.model,
      messages: messages,
      max_tokens: options.maxTokens || this.service.maxTokens,
      temperature: options.temperature || this.service.temperature
    };
    
    const data = await this.makeRequest(this.endpoint, payload);
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  }
}

class OpenAIProvider extends BaseProvider {
  constructor(service) {
    super(service);
    this.endpoint = service.endpoint || 'https://api.openai.com/v1/chat/completions';
    this.model = service.model || 'gpt-3.5-turbo';
  }

  async chat(messages, options = {}) {
    const payload = {
      model: this.model,
      messages: messages,
      max_tokens: options.maxTokens || this.service.maxTokens,
      temperature: options.temperature || this.service.temperature
    };
    
    const data = await this.makeRequest(this.endpoint, payload);
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  }
}

module.exports = { LLMService };
