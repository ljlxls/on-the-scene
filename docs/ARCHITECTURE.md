# 亲临其境 - 系统架构设计文档

> 基于OpenMAIC成熟架构的AI角色扮演应用

## 1. 项目概述

### 1.1 核心概念映射

| OpenMAIC概念 | 亲临其境概念 | 说明 |
|-------------|-------------|------|
| 上传学习资料 | 上传小说 | PDF/TXT小说文件 |
| 课程规划器 | 世界构建器 | 分析小说，生成世界观和角色 |
| 场景大纲(Scene Outline) | 故事大纲(Story Outline) | 故事章节和情节规划 |
| 场景(Scene) | 故事场景(Story Scene) | 对话、事件、冲突场景 |
| AI教师 | 上帝之手智能体 | 叙述故事、推进剧情、协调角色 |
| AI同学 | 角色智能体 | 小说中的其他角色NPC |
| 学生 | 用户扮演角色 | 用户控制的角色 |
| 幻灯片/测验/交互 | 故事场景类型 | 对话、事件、探索、战斗等 |

### 1.2 核心功能

1. **小说上传与分析**：用户上传小说，系统自动分析并提取世界观、角色、情节
2. **世界构建**：生成小说世界的背景、规则、重要事件
3. **角色智能体生成**：为每个角色创建独立的灵魂文件、记忆系统
4. **沉浸式角色扮演**：用户选择角色，与其他AI角色互动推进故事
5. **动态角色切换**：用户可以在不同角色间切换

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           亲临其境 系统架构                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        前端层 (Next.js App Router)                 │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │ │
│  │  │ 首页    │  │小说上传  │  │角色选择  │  │角色扮演  │  │ 设置页  │  │ │
│  │  │ /       │  │/upload  │  │/novel/id│  │/play/id │  │/settings│  │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        API层 (Next.js API Routes)                  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │ │
│  │  │/api/novels  │  │/api/stories │  │/api/chat    │                │ │
│  │  │小说管理API  │  │故事生成API  │  │角色扮演API  │                │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        服务层 (Core Services)                      │ │
│  │                                                                    │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │ │
│  │  │  世界构建服务    │  │  故事生成服务    │  │  智能体编排服务  │    │ │
│  │  │ WorldBuilder    │  │ StoryGenerator  │  │ AgentOrchestrator│    │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │ │
│  │                                                                    │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │ │
│  │  │  小说解析服务    │  │  角色生成服务    │  │  大模型服务      │    │ │
│  │  │ NovelParser     │  │ CharacterGen    │  │ LLMService      │    │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        数据层 (Data Layer)                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │ │
│  │  │  IndexedDB      │  │  文件存储        │  │  大模型API      │    │ │
│  │  │  (本地存储)     │  │  (小说文件)      │  │  (Groq等)       │    │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 两阶段生成流水线

借鉴OpenMAIC的两阶段设计：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        两阶段生成流水线                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Stage 1: 小说分析 → 世界构建                                            │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  输入: 小说文本 (PDF/TXT)                                          │ │
│  │  输出:                                                             │ │
│  │    - 世界观 (WorldSetting)                                         │ │
│  │    - 角色列表 (CharacterList)                                      │ │
│  │    - 故事大纲 (StoryOutline[])                                     │ │
│  │    - 关键事件 (KeyEvents)                                          │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    ▼                                    │
│  Stage 2: 故事大纲 → 场景生成 + 智能体创建                                │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  输入: 故事大纲 + 角色列表                                          │ │
│  │  输出:                                                             │ │
│  │    - 故事场景 (StoryScene[])                                       │ │
│  │    - 角色智能体配置 (AgentConfig[])                                 │ │
│  │    - 灵魂文件 (SoulFile[])                                         │ │
│  │    - 初始记忆 (MemoryFile[])                                       │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心模块设计

### 3.1 世界构建服务 (WorldBuilder)

负责分析小说并生成世界观：

```typescript
interface WorldSetting {
  id: string;
  novelId: string;
  
  // 世界观核心
  worldName: string;           // 世界名称
  worldType: string;           // 世界类型 (奇幻/科幻/现代/古代等)
  timePeriod: string;          // 时间背景
  geography: string;           // 地理环境
  socialStructure: string;     // 社会结构
  rules: string[];             // 世界规则 (魔法系统/科技水平等)
  
  // 故事核心
  mainConflict: string;        // 主要冲突
  themes: string[];            // 主题
  tone: string;                // 基调 (轻松/严肃/黑暗等)
  
  // 关键元素
  keyLocations: Location[];    // 重要地点
  keyEvents: Event[];          // 关键事件
  relationships: Relationship[]; // 角色关系
  
  // 元数据
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 角色生成服务 (CharacterGenerator)

负责从小说中提取角色并生成智能体配置：

```typescript
interface Character {
  id: string;
  novelId: string;
  
  // 基本信息
  name: string;
  aliases: string[];           // 别名/称号
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  importance: number;          // 重要程度 1-10
  
  // 外观
  appearance: {
    description: string;
    avatar?: string;           // 头像URL或emoji
    color: string;             // UI主题色
  };
  
  // 性格与背景
  personality: string[];       // 性格特点
  background: string;          // 背景故事
  motivations: string[];       // 动机
  fears: string[];             // 恐惧
  values: string[];            // 价值观
  
  // 能力
  abilities: string[];         // 能力/技能
  weaknesses: string[];        // 弱点
  
  // 关系
  relationships: {
    targetId: string;
    type: string;              // 朋友/敌人/家人/恋人等
    description: string;
  }[];
  
  // 智能体配置
  agentConfig: AgentConfig;
}

interface AgentConfig {
  id: string;
  name: string;
  role: string;                // 角色定位描述
  persona: string;             // 完整的系统提示词
  
  // 外观配置
  avatar: string;              // emoji或图片URL
  color: string;               // UI主题色
  
  // 行为配置
  allowedActions: string[];    // 允许的动作
  priority: number;            // 导演选择优先级
  
  // 语音配置 (可选)
  voiceConfig?: {
    providerId: string;
    voiceId: string;
  };
  
  // 灵魂文件
  soulFile: SoulFile;
  
  // 元数据
  isUserControlled: boolean;   // 是否由用户控制
  isGenerated: boolean;        // 是否由LLM生成
}
```

### 3.3 灵魂文件系统 (SoulFile System)

每个角色智能体都有独立的灵魂文件：

```typescript
interface SoulFile {
  characterId: string;
  
  // 核心身份
  identity: {
    name: string;
    role: string;
    coreTraits: string[];      // 核心特质
  };
  
  // 性格系统
  personality: {
    traits: string[];          // 性格特点
    speechStyle: string;       // 说话风格
    decisionStyle: string;     // 决策风格
  };
  
  // 背景故事
  backstory: {
    origin: string;            // 出身
    keyEvents: string[];       // 关键经历
    secrets: string[];         // 秘密
  };
  
  // 动机系统
  motivations: {
    goals: string[];           // 目标
    desires: string[];         // 欲望
    fears: string[];           // 恐惧
  };
  
  // 关系图谱
  relationships: {
    [characterId: string]: {
      type: string;
      attitude: string;        // 态度
      history: string;         // 历史
    };
  };
  
  // 行为准则
  behaviorRules: {
    alwaysDo: string[];        // 总是会做的事
    neverDo: string[];         // 绝对不会做的事
    triggers: {                 // 触发条件
      condition: string;
      reaction: string;
    }[];
  };
}
```

### 3.4 记忆系统 (Memory System)

```typescript
interface MemoryFile {
  characterId: string;
  
  // 短期记忆 (当前会话)
  shortTerm: {
    recentEvents: Event[];
    currentGoal: string;
    activeEmotions: string[];
  };
  
  // 长期记忆 (持久化)
  longTerm: {
    importantEvents: Event[];
    learnedLessons: string[];
    developedRelationships: Relationship[];
  };
  
  // 习惯系统
  habits: {
    speechPatterns: string[];  // 说话习惯
    behavioralPatterns: string[]; // 行为习惯
    decisionPatterns: string[];   // 决策习惯
  };
}
```

---

## 4. 智能体编排系统

### 4.1 导演智能体 (Director Agent)

类似OpenMAIC的Director节点，负责：
- 决定下一个发言的角色
- 控制故事节奏
- 引入事件和冲突
- 协调多角色互动

```
导演智能体决策流程:

START → 导演智能体 ──(故事结束)──→ END
            │
            ├─(用户回合)→ 等待用户输入 → 导演智能体
            │
            ├─(角色回合)→ 角色智能体生成 → 导演智能体
            │
            └─(事件触发)→ 系统事件处理 → 导演智能体
```

### 4.2 角色智能体 (Character Agent)

每个角色都是独立的智能体：

```typescript
// 角色智能体生成流程
async function runCharacterAgent(
  state: StoryState,
  characterId: string,
  config: AgentConfig
): Promise<AgentResponse> {
  
  // 1. 构建系统提示词
  const systemPrompt = buildCharacterPrompt(
    config.soulFile,
    state.worldSetting,
    state.currentScene,
    state.memoryFiles[characterId]
  );
  
  // 2. 构建对话历史
  const messages = buildConversationHistory(state, characterId);
  
  // 3. 调用大模型生成响应
  const response = await llmService.chat(systemPrompt, messages);
  
  // 4. 解析响应
  const parsed = parseAgentResponse(response);
  
  // 5. 更新记忆
  updateMemory(characterId, parsed);
  
  return parsed;
}
```

### 4.3 用户角色控制

用户可以动态切换控制的角色：

```typescript
interface UserCharacterControl {
  currentCharacterId: string;
  availableCharacters: string[];
  
  // 切换角色
  switchCharacter(newCharacterId: string): void;
  
  // 用户输入处理
  handleUserInput(input: string): AgentResponse;
}
```

---

## 5. 故事场景类型

### 5.1 场景类型定义

```typescript
type SceneType = 
  | 'dialogue'      // 对话场景
  | 'narration'     // 叙述场景
  | 'exploration'   // 探索场景
  | 'conflict'      // 冲突场景
  | 'revelation'    // 揭示场景
  | 'transition';   // 过渡场景

interface StoryScene {
  id: string;
  storyId: string;
  
  // 场景基本信息
  type: SceneType;
  title: string;
  description: string;
  order: number;
  
  // 场景内容
  location: string;
  presentCharacters: string[];
  atmosphere: string;
  
  // 场景目标
  objectives: {
    type: 'information' | 'relationship' | 'conflict' | 'choice';
    description: string;
    completed: boolean;
  }[];
  
  // 场景事件
  events: SceneEvent[];
  
  // 用户选择 (可选)
  choices?: {
    id: string;
    text: string;
    consequences: string;
  }[];
}
```

### 5.2 场景生成Prompt模板

```markdown
# 故事场景生成

## 世界背景
{{worldSetting}}

## 当前角色
{{characters}}

## 场景大纲
{{sceneOutline}}

## 生成要求
1. 场景类型: {{sceneType}}
2. 参与角色: {{presentCharacters}}
3. 场景目标: {{objectives}}
4. 氛围基调: {{atmosphere}}

## 输出格式
{
  "narration": "场景描述...",
  "dialogues": [
    {
      "characterId": "xxx",
      "content": "对话内容...",
      "actions": ["动作1", "动作2"]
    }
  ],
  "events": [...],
  "choices": [...]
}
```

---

## 6. API设计

### 6.1 小说管理API

```typescript
// POST /api/novels - 上传小说
interface UploadNovelRequest {
  title: string;
  content: string;  // 或文件上传
}

interface UploadNovelResponse {
  id: string;
  status: 'uploaded' | 'analyzing' | 'ready';
}

// GET /api/novels/:id/analysis - 获取分析结果
interface AnalysisResponse {
  status: 'analyzing' | 'completed' | 'failed';
  progress: number;
  worldSetting?: WorldSetting;
  characters?: Character[];
  storyOutline?: StoryOutline[];
}
```

### 6.2 角色扮演API

```typescript
// POST /api/stories - 创建故事会话
interface CreateStoryRequest {
  novelId: string;
  userCharacterId: string;  // 用户选择扮演的角色
}

interface CreateStoryResponse {
  id: string;
  status: 'created';
  initialScene: StoryScene;
}

// POST /api/stories/:id/chat - 角色扮演对话
interface ChatRequest {
  message: string;
  characterId?: string;  // 如果用户切换角色
}

interface ChatResponse {
  type: 'character' | 'narration' | 'event';
  content: string;
  speaker?: {
    id: string;
    name: string;
    avatar: string;
  };
  actions?: string[];
  choices?: Choice[];
}
```

---

## 7. 前端页面设计

### 7.1 页面路由

| 路由 | 页面 | 功能 |
|------|------|------|
| `/` | 首页 | 项目介绍、小说上传入口 |
| `/upload` | 上传页 | 小说上传和分析进度 |
| `/novel/:id` | 小说详情 | 世界观展示、角色选择 |
| `/play/:id` | 角色扮演 | 故事互动界面 |
| `/settings` | 设置页 | API配置、系统设置 |

### 7.2 角色扮演界面

```
┌─────────────────────────────────────────────────────────────────┐
│  角色扮演界面                                                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    故事场景区域                           │   │
│  │  [场景描述/叙述内容]                                      │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ 角色A: 对话内容...                                │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ 角色B: 对话内容...                                │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    角色状态栏                             │   │
│  │  [角色A头像] [角色B头像] [角色C头像] ...                  │   │
│  │  当前控制: [用户角色名] [切换角色▼]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    用户输入区域                           │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ 输入你的行动/对话...                              │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  [发送] [自动生成] [选择行动▼]                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. 实现计划

### Phase 1: 基础架构 (1-2周)

- [ ] 基于OpenMAIC创建项目骨架
- [ ] 实现小说上传和解析
- [ ] 实现世界构建服务
- [ ] 实现角色提取服务

### Phase 2: 智能体系统 (2-3周)

- [ ] 实现灵魂文件系统
- [ ] 实现记忆系统
- [ ] 实现导演智能体
- [ ] 实现角色智能体

### Phase 3: 故事生成 (2周)

- [ ] 实现故事大纲生成
- [ ] 实现场景生成
- [ ] 实现对话生成

### Phase 4: 前端开发 (2周)

- [ ] 实现首页和上传页
- [ ] 实现角色选择页
- [ ] 实现角色扮演界面
- [ ] 实现设置页

### Phase 5: 测试和优化 (1周)

- [ ] 端到端测试
- [ ] 性能优化
- [ ] 用户体验优化

---

## 9. 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 15 | App Router, React 19 |
| 样式 | Tailwind CSS | 响应式设计 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 后端 | Next.js API Routes | 服务端API |
| 智能体编排 | LangGraph | 多智能体编排 |
| 大模型 | Groq/DeepSeek | 免费API |
| 存储 | IndexedDB | 本地存储 |
| 文件解析 | pdf-parse | PDF解析 |

---

## 10. 目录结构

```
on-the-scene/
├── app/                          # Next.js App Router
│   ├── api/                      # API路由
│   │   ├── novels/               # 小说管理API
│   │   ├── stories/              # 故事生成API
│   │   ├── chat/                 # 角色扮演API
│   │   └── models/               # 模型配置API
│   ├── upload/                   # 上传页
│   ├── novel/[id]/               # 小说详情页
│   ├── play/[id]/                # 角色扮演页
│   ├── settings/                 # 设置页
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                   # React组件
│   ├── ui/                       # 基础UI组件
│   ├── chat/                     # 聊天组件
│   ├── character/                # 角色组件
│   └── story/                    # 故事组件
├── lib/                          # 核心库
│   ├── services/                 # 服务层
│   │   ├── world-builder.ts      # 世界构建服务
│   │   ├── character-gen.ts      # 角色生成服务
│   │   ├── story-generator.ts    # 故事生成服务
│   │   └── llm-service.ts        # 大模型服务
│   ├── orchestration/            # 智能体编排
│   │   ├── director-graph.ts     # 导演图
│   │   ├── character-agent.ts    # 角色智能体
│   │   └── prompt-builder.ts     # 提示词构建
│   ├── types/                    # 类型定义
│   └── utils/                    # 工具函数
├── prompts/                      # Prompt模板
│   ├── world-building/           # 世界构建提示词
│   ├── character-gen/            # 角色生成提示词
│   └── story-gen/                # 故事生成提示词
├── public/                       # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```
