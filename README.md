# 亲临其境

> AI角色扮演游戏应用 - 与AI大模型一起经历新的人生

## 项目介绍

**亲临其境** 是一个创新的AI角色扮演应用，用户可以上传小说，让AI分析并生成角色，创建沉浸式的角色扮演体验。

### 核心功能

- **小说上传与分析**：上传小说文件，"上帝之手"智能体自动分析并提取角色
- **角色智能体**：每个角色拥有独立的灵魂、记忆和习惯系统
- **沉浸式角色扮演**：多智能体协作推进故事发展
- **多模型支持**：支持DeepSeek、Groq、智谱AI、Moonshot等多种大模型API

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Tailwind CSS + Vite |
| 后端 | Express.js |
| 数据库 | PostgreSQL |
| 大模型 | DeepSeek / Groq / 智谱AI / Moonshot |

---

## 项目结构

```
亲临其境/
├── ai-roleplay-demo/
│   ├── backend/                 # 后端服务
│   │   ├── server.js           # Express服务器入口
│   │   ├── services/           # 服务层
│   │   │   └── llmService.js   # 大模型服务
│   │   ├── test-llm.js         # API测试工具
│   │   ├── .env.example        # 环境变量示例
│   │   └── package.json
│   └── frontend/               # 前端服务
│       ├── src/                # React源码
│       ├── public/             # 静态资源
│       └── package.json
├── PRD.md                      # 产品需求文档
├── 技术架构文档.md              # 技术架构设计
├── 系统详细设计.md              # 系统详细设计
└── README.md                   # 项目说明
```

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm 或 pnpm
- PostgreSQL（可选，开发阶段可使用内存数据）

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://gitee.com/ddxydbl/on-the-scene.git
cd on-the-scene
```

#### 2. 安装后端依赖

```bash
cd ai-roleplay-demo/backend
npm install
```

#### 3. 安装前端依赖

```bash
cd ../frontend
pnpm install
# 或使用 npm
npm install
```

#### 4. 配置环境变量

```bash
cd ../backend
cp .env.example .env
```

编辑 `.env` 文件，填入你的大模型API密钥：

```env
# 选择一个或多个配置即可
DEEPSEEK_API_KEY=your_deepseek_api_key
GROQ_API_KEY=your_groq_api_key
ZHIPU_API_KEY=your_zhipu_api_key
MOONSHOT_API_KEY=your_moonshot_api_key
```

#### 5. 启动服务

**启动后端服务**（终端1）：
```bash
cd ai-roleplay-demo/backend
npm start
# 后端运行在 http://localhost:3001
```

**启动前端服务**（终端2）：
```bash
cd ai-roleplay-demo/frontend
pnpm dev
# 前端运行在 http://localhost:5173
```

#### 6. 访问应用

打开浏览器访问：http://localhost:5173

---

## 大模型API配置

### 支持的API提供商

| 提供商 | 特点 | 获取地址 |
|--------|------|----------|
| **Groq** | 免费、速度快、Llama模型 | https://console.groq.com/ |
| **DeepSeek** | 新用户免费额度、国内访问稳定 | https://platform.deepseek.com/ |
| **智谱AI** | 免费额度大、GLM-4模型 | https://open.bigmodel.cn/ |
| **Moonshot** | 月之暗面Kimi、有免费额度 | https://platform.moonshot.cn/ |

### 测试大模型连接

```bash
cd ai-roleplay-demo/backend

# 测试连接
npm run test:llm groq test

# 测试小说分析
npm run test:llm deepseek analyze

# 进入交互聊天模式
npm run test:llm zhipu chat
```

---

## API文档

### 后端API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/novels` | GET | 获取小说列表 |
| `/api/novels` | POST | 上传小说 |
| `/api/novels/:id/analysis` | GET | 获取小说分析结果 |
| `/api/sessions` | POST | 创建角色扮演会话 |
| `/api/sessions/:id` | GET | 获取会话详情 |
| `/api/sessions/:id/messages` | POST | 发送消息 |
| `/api/models` | GET | 获取模型配置列表 |

---

## 智能体系统

### 三层能力架构

1. **灵魂文件 (SOUL.md)**：角色的核心性格、背景故事和价值观
2. **记忆文件 (MEMORY.md)**：角色的关键经历和重要事件
3. **习惯文件 (HABIT.md)**：角色的行为习惯和决策模式

### "上帝之手"智能体

负责分析小说、生成角色、描述故事背景、协调其他角色智能体的交互。

---

## 开发路线

- [x] 项目架构设计
- [x] 后端基础框架
- [x] 前端基础框架
- [x] 大模型服务集成
- [ ] 小说分析功能
- [ ] 角色智能体系统
- [ ] 前端页面开发
- [ ] 数据库集成
- [ ] 用户认证系统

---

## 参与贡献

1. Fork 本仓库
2. 新建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 许可证

本项目采用 MIT 许可证

---

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
