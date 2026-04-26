# 亲临其境 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 基于OpenMAIC架构实现AI角色扮演应用

**Architecture:** Next.js 15全栈架构 + LangGraph智能体编排 + IndexedDB本地存储

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, Zustand, LangGraph, Groq/DeepSeek API

---

## Phase 1: 项目初始化

### Task 1: 创建Next.js项目

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `next.config.ts`

- [ ] **Step 1: 创建Next.js项目**

```bash
cd /Users/alex/Desktop/亲临其境
npx create-next-app@latest on-the-scene --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

- [ ] **Step 2: 安装核心依赖**

```bash
cd on-the-scene
npm install zustand nanoid idb
npm install @langchain/langgraph @langchain/core
```

- [ ] **Step 3: 创建目录结构**

```bash
mkdir -p lib/services lib/orchestration lib/storage lib/types lib/utils
mkdir -p components/ui components/chat components/character components/story
mkdir -p prompts/world-building prompts/character-gen prompts/story-gen
```

---

## Phase 2: 类型定义

### Task 2: 创建核心类型定义

**Files:**
- Create: `lib/types/novel.ts`
- Create: `lib/types/character.ts`
- Create: `lib/types/story.ts`
- Create: `lib/types/agent.ts`

- [ ] **Step 1: 创建小说类型**

```typescript
// lib/types/novel.ts
export interface Novel {
  id: string;
  title: string;
  content: string;
  status: 'uploaded' | 'analyzing' | 'ready' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldSetting {
  id: string;
  novelId: string;
  worldName: string;
  worldType: string;
  timePeriod: string;
  geography: string;
  socialStructure: string;
  rules: string[];
  mainConflict: string;
  themes: string[];
  tone: string;
  keyLocations: KeyLocation[];
  keyEvents: KeyEvent[];
}
```

- [ ] **Step 2: 创建角色类型**

```typescript
// lib/types/character.ts
export interface Character {
  id: string;
  novelId: string;
  name: string;
  aliases: string[];
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  importance: number;
  appearance: CharacterAppearance;
  personality: string[];
  background: string;
  motivations: string[];
  fears: string[];
  values: string[];
  abilities: string[];
  weaknesses: string[];
  relationships: CharacterRelationship[];
  agentConfig: AgentConfig;
}

export interface SoulFile {
  characterId: string;
  identity: SoulIdentity;
  personality: SoulPersonality;
  backstory: SoulBackstory;
  motivations: SoulMotivations;
  relationships: Record<string, RelationshipInfo>;
  behaviorRules: BehaviorRules;
}

export interface MemoryFile {
  characterId: string;
  shortTerm: ShortTermMemory;
  longTerm: LongTermMemory;
  habits: HabitPatterns;
}
```

---

## Phase 3: 存储层

### Task 3: 实现IndexedDB存储

**Files:**
- Create: `lib/storage/db.ts`
- Create: `lib/storage/storage-service.ts`

- [ ] **Step 1: 创建数据库配置**

```typescript
// lib/storage/db.ts
import { openDB } from 'idb';

const DB_NAME = 'on-the-scene';
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Novels store
      if (!db.objectStoreNames.contains('novels')) {
        const novelStore = db.createObjectStore('novels', { keyPath: 'id' });
        novelStore.createIndex('by-status', 'status');
      }
      
      // World settings store
      if (!db.objectStoreNames.contains('worldSettings')) {
        const worldStore = db.createObjectStore('worldSettings', { keyPath: 'id' });
        worldStore.createIndex('by-novel', 'novelId');
      }
      
      // Characters store
      if (!db.objectStoreNames.contains('characters')) {
        const charStore = db.createObjectStore('characters', { keyPath: 'id' });
        charStore.createIndex('by-novel', 'novelId');
      }
      
      // Stories store
      if (!db.objectStoreNames.contains('stories')) {
        const storyStore = db.createObjectStore('stories', { keyPath: 'id' });
        storyStore.createIndex('by-novel', 'novelId');
      }
      
      // Chat messages store
      if (!db.objectStoreNames.contains('chatMessages')) {
        const msgStore = db.createObjectStore('chatMessages', { keyPath: 'id' });
        msgStore.createIndex('by-story', 'storyId');
      }
      
      // Memory files store
      if (!db.objectStoreNames.contains('memoryFiles')) {
        const memStore = db.createObjectStore('memoryFiles', { keyPath: 'id' });
        memStore.createIndex('by-character', 'characterId');
      }
      
      // Model configs store
      if (!db.objectStoreNames.contains('modelConfigs')) {
        db.createObjectStore('modelConfigs', { keyPath: 'id' });
      }
    }
  });
}
```

---

## Phase 4: 大模型服务

### Task 4: 实现LLM服务

**Files:**
- Create: `lib/services/llm-service.ts`

- [ ] **Step 1: 创建LLM服务**

```typescript
// lib/services/llm-service.ts
import { nanoid } from 'nanoid';

export interface LLMConfig {
  provider: 'groq' | 'deepseek' | 'openai';
  apiKey: string;
  endpoint?: string;
  modelName: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class LLMService {
  private config: LLMConfig | null = null;
  
  setConfig(config: LLMConfig) {
    this.config = config;
  }
  
  getConfig(): LLMConfig | null {
    return this.config;
  }
  
  async chat(messages: ChatMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<string> {
    if (!this.config) {
      throw new Error('LLM config not set');
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
        temperature: options?.temperature || 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async *streamChat(messages: ChatMessage[], options?: { maxTokens?: number; temperature?: number }): AsyncGenerator<string> {
    if (!this.config) {
      throw new Error('LLM config not set');
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
}

export const llmService = new LLMService();
```

---

## Phase 5: 世界构建服务

### Task 5: 实现世界构建服务

**Files:**
- Create: `lib/services/world-builder.ts`

---

## Phase 6: 角色生成服务

### Task 6: 实现角色生成服务

**Files:**
- Create: `lib/services/character-gen.ts`

---

## Phase 7: 智能体编排系统

### Task 7: 实现导演智能体

**Files:**
- Create: `lib/orchestration/director-graph.ts`
- Create: `lib/orchestration/character-agent.ts`
- Create: `lib/orchestration/prompt-builder.ts`

---

## Phase 8: API路由

### Task 8: 实现API路由

**Files:**
- Create: `app/api/novels/route.ts`
- Create: `app/api/novels/[id]/route.ts`
- Create: `app/api/novels/[id]/analysis/route.ts`
- Create: `app/api/stories/route.ts`
- Create: `app/api/chat/route.ts`
- Create: `app/api/models/route.ts`

---

## Phase 9: 前端页面

### Task 9: 实现首页

**Files:**
- Create: `app/page.tsx`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

---

### Task 10: 实现上传页

**Files:**
- Create: `app/upload/page.tsx`

---

### Task 11: 实现小说详情页

**Files:**
- Create: `app/novel/[id]/page.tsx`

---

### Task 12: 实现角色扮演页

**Files:**
- Create: `app/play/[id]/page.tsx`

---

### Task 13: 实现设置页

**Files:**
- Create: `app/settings/page.tsx`

---

## Phase 10: 部署和测试

### Task 14: 测试和部署

- [ ] 测试小说上传功能
- [ ] 测试世界构建功能
- [ ] 测试角色生成功能
- [ ] 测试角色扮演功能
- [ ] 部署到Vercel

---

## 执行顺序

1. Phase 1: 项目初始化
2. Phase 2: 类型定义
3. Phase 3: 存储层
4. Phase 4: 大模型服务
5. Phase 5: 世界构建服务
6. Phase 6: 角色生成服务
7. Phase 7: 智能体编排系统
8. Phase 8: API路由
9. Phase 9-13: 前端页面
10. Phase 10: 部署和测试
