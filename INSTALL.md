# 安装指南

本文档详细说明如何安装和配置"亲临其境"项目。

---

## 目录

- [环境要求](#环境要求)
- [安装步骤](#安装步骤)
- [配置说明](#配置说明)
- [常见问题](#常见问题)

---

## 环境要求

### 必需软件

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18.0.0 | JavaScript运行时 |
| npm | >= 9.0.0 | Node包管理器 |
| pnpm | >= 8.0.0 | 可选，更快的包管理器 |
| Git | >= 2.0.0 | 版本控制 |

### 可选软件

| 软件 | 说明 |
|------|------|
| PostgreSQL | 生产环境数据库 |
| VS Code | 推荐的代码编辑器 |

### 检查环境

```bash
# 检查 Node.js 版本
node -v

# 检查 npm 版本
npm -v

# 检查 Git 版本
git --version
```

---

## 安装步骤

### 第一步：克隆项目

```bash
# 克隆仓库
git clone https://gitee.com/ddxydbl/on-the-scene.git

# 进入项目目录
cd on-the-scene
```

### 第二步：安装后端依赖

```bash
cd ai-roleplay-demo/backend
npm install
```

预期输出：
```
added 214 packages in 10s
```

### 第三步：安装前端依赖

```bash
cd ../frontend

# 推荐使用 pnpm（更快）
pnpm install

# 或使用 npm
npm install
```

预期输出：
```
dependencies:
+ react 19.2.5
+ react-dom 19.2.5
...
Done in 51s
```

### 第四步：配置环境变量

```bash
cd ../backend

# 复制环境变量模板
cp .env.example .env
```

编辑 `.env` 文件：

```env
# DeepSeek API (推荐)
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx

# Groq API (免费)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx

# 智谱AI API
ZHIPU_API_KEY=xxxxxxxxxxxxxxxx

# Moonshot API
MOONSHOT_API_KEY=sk-xxxxxxxxxxxxxxxx
```

> **注意**：至少配置一个API密钥才能使用AI功能。

### 第五步：启动服务

#### 启动后端服务

打开终端1：
```bash
cd ai-roleplay-demo/backend
npm start
```

看到以下输出表示成功：
```
Server running on port 3001
```

#### 启动前端服务

打开终端2：
```bash
cd ai-roleplay-demo/frontend
pnpm dev
```

看到以下输出表示成功：
```
VITE v8.0.10  ready in 3007 ms

➜  Local:   http://localhost:5173/
```

### 第六步：验证安装

1. 打开浏览器访问 http://localhost:5173
2. 应该能看到前端页面
3. 测试后端API：
   ```bash
   curl http://localhost:3001/api/novels
   ```

---

## 配置说明

### 大模型API获取指南

#### Groq（推荐，免费）

1. 访问 https://console.groq.com/
2. 使用 Google 或 GitHub 账号登录
3. 点击左侧 "API Keys"
4. 点击 "Create API Key"
5. 复制生成的密钥（以 `gsk_` 开头）

#### DeepSeek

1. 访问 https://platform.deepseek.com/
2. 注册账号
3. 进入 "API Keys" 页面
4. 创建新的 API 密钥

#### 智谱AI

1. 访问 https://open.bigmodel.cn/
2. 注册账号
3. 进入控制台获取 API Key

#### Moonshot

1. 访问 https://platform.moonshot.cn/
2. 注册账号
3. 获取 API Key

### 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | 否 | DeepSeek API密钥 |
| `GROQ_API_KEY` | 否 | Groq API密钥 |
| `ZHIPU_API_KEY` | 否 | 智谱AI API密钥 |
| `MOONSHOT_API_KEY` | 否 | Moonshot API密钥 |

---

## 常见问题

### Q: npm install 报权限错误

**解决方案**：
```bash
# 清理 npm 缓存
npm cache clean --force

# 或使用 pnpm
pnpm install
```

### Q: 端口被占用

**解决方案**：
```bash
# 查看占用端口的进程
lsof -i :3001

# 终止进程
kill -9 <PID>
```

### Q: 前端无法连接后端

**解决方案**：
1. 确认后端服务已启动
2. 检查后端是否运行在 3001 端口
3. 检查浏览器控制台是否有 CORS 错误

### Q: 大模型API调用失败

**解决方案**：
1. 检查 `.env` 文件中的 API 密钥是否正确
2. 确认 API 密钥有效且有余额
3. 检查网络连接

### Q: 如何测试大模型连接

```bash
cd ai-roleplay-demo/backend

# 测试 Groq
npm run test:llm groq test

# 测试 DeepSeek
npm run test:llm deepseek test
```

---

## 开发模式

### 热重载

后端使用 nodemon 实现热重载：
```bash
cd ai-roleplay-demo/backend
npm run dev
```

前端 Vite 自带热重载功能。

### 调试模式

```bash
# 后端调试
DEBUG=* npm start

# 查看详细日志
NODE_ENV=development npm start
```

---

## 生产部署

### 构建前端

```bash
cd ai-roleplay-demo/frontend
pnpm build
```

构建产物在 `dist/` 目录。

### 构建后端

```bash
cd ai-roleplay-demo/backend
NODE_ENV=production npm start
```

---

## 下一步

安装完成后，你可以：

1. 阅读 [PRD.md](./PRD.md) 了解产品需求
2. 阅读 [技术架构文档.md](./技术架构文档.md) 了解系统设计
3. 开始开发新功能

如有问题，请提交 Issue。
