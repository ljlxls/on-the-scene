# On The Scene

> AI Role-Playing Game Application - Experience a new life with AI

## Introduction

**On The Scene** is an innovative AI role-playing application where users can upload novels, have AI analyze and generate characters, and create immersive role-playing experiences.

### Core Features

- **Novel Upload & Analysis**: Upload novels, "God's Hand" agent automatically analyzes and extracts characters
- **Character Agents**: Each character has independent soul, memory, and habit systems
- **Immersive Role-Playing**: Multi-agent collaboration to advance the story
- **Multi-Model Support**: Supports DeepSeek, Groq, Zhipu AI, Moonshot and other LLM APIs

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Tailwind CSS + Vite |
| Backend | Express.js |
| Database | PostgreSQL |
| LLM | DeepSeek / Groq / Zhipu AI / Moonshot |

---

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm
- PostgreSQL (optional)

### Installation

```bash
# Clone the repository
git clone https://gitee.com/ddxydbl/on-the-scene.git
cd on-the-scene

# Install backend dependencies
cd ai-roleplay-demo/backend
npm install

# Install frontend dependencies
cd ../frontend
pnpm install

# Configure environment variables
cd ../backend
cp .env.example .env
# Edit .env and add your API keys
```

### Run

```bash
# Terminal 1: Start backend
cd ai-roleplay-demo/backend
npm start

# Terminal 2: Start frontend
cd ai-roleplay-demo/frontend
pnpm dev
```

Access the application at: http://localhost:5173

---

## LLM API Configuration

| Provider | Features | Get API Key |
|----------|----------|-------------|
| **Groq** | Free, Fast, Llama models | https://console.groq.com/ |
| **DeepSeek** | Free tier, Stable in China | https://platform.deepseek.com/ |
| **Zhipu AI** | Large free tier, GLM-4 | https://open.bigmodel.cn/ |
| **Moonshot** | Kimi, Free tier | https://platform.moonshot.cn/ |

---

## Project Structure

```
on-the-scene/
├── ai-roleplay-demo/
│   ├── backend/          # Express.js backend
│   │   ├── server.js
│   │   ├── services/
│   │   └── test-llm.js
│   └── frontend/         # React frontend
│       └── src/
├── PRD.md               # Product Requirements
├── 技术架构文档.md        # Technical Architecture
├── 系统详细设计.md        # System Design
└── README.md            # Documentation
```

---

## License

MIT License

---

## Contact

For questions or suggestions, please submit an Issue or Pull Request.
