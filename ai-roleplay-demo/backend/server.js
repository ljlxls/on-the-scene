const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 模拟数据
const mockNovels = [
  {
    id: 1,
    title: '示例小说',
    content: '这是一个示例小说，讲述了一个关于冒险的故事。',
    status: 'analyzed',
    characters: [
      {
        id: 1,
        name: '主角',
        description: '勇敢、聪明的年轻人'
      },
      {
        id: 2,
        name: '配角1',
        description: '主角的朋友，幽默风趣'
      },
      {
        id: 3,
        name: '反派',
        description: '邪恶的对手'
      }
    ]
  }
];

const mockSessions = [
  {
    id: 1,
    novelId: 1,
    characterId: 1,
    messages: [
      {
        id: 1,
        content: '故事开始了，主角站在一个神秘的森林中。',
        type: 'system',
        senderId: null
      },
      {
        id: 2,
        content: '配角1：嘿，朋友，我们应该往哪个方向走？',
        type: 'character',
        senderId: 2
      }
    ]
  }
];

// API路由

// 小说相关
app.get('/api/novels', (req, res) => {
  res.json(mockNovels);
});

app.post('/api/novels', (req, res) => {
  const newNovel = {
    id: mockNovels.length + 1,
    title: req.body.title,
    content: req.body.content,
    status: 'uploaded',
    characters: []
  };
  mockNovels.push(newNovel);
  res.json(newNovel);
});

app.get('/api/novels/:id/analysis', (req, res) => {
  const novel = mockNovels.find(n => n.id === parseInt(req.params.id));
  if (novel) {
    res.json({
      status: 'completed',
      progress: 100,
      characters: novel.characters
    });
  } else {
    res.status(404).json({ error: 'Novel not found' });
  }
});

// 会话相关
app.post('/api/sessions', (req, res) => {
  const newSession = {
    id: mockSessions.length + 1,
    novelId: parseInt(req.body.novelId),
    characterId: parseInt(req.body.characterId),
    messages: [
      {
        id: 1,
        content: '故事开始了，你站在一个神秘的森林中。',
        type: 'system',
        senderId: null
      }
    ]
  };
  mockSessions.push(newSession);
  res.json(newSession);
});

app.get('/api/sessions/:id', (req, res) => {
  const session = mockSessions.find(s => s.id === parseInt(req.params.id));
  if (session) {
    res.json(session);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

app.post('/api/sessions/:id/messages', (req, res) => {
  const session = mockSessions.find(s => s.id === parseInt(req.params.id));
  if (session) {
    const newMessage = {
      id: session.messages.length + 1,
      content: req.body.content,
      type: 'user',
      senderId: null
    };
    session.messages.push(newMessage);
    
    // 模拟角色响应
    const characterResponse = {
      id: session.messages.length + 1,
      content: '配角1：这是一个模拟的响应。',
      type: 'character',
      senderId: 2
    };
    session.messages.push(characterResponse);
    
    res.json(characterResponse);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// 模型配置相关
app.get('/api/models', (req, res) => {
  res.json({
    models: [
      {
        id: 1,
        name: 'OpenAI GPT-4',
        apiKey: 'sk-...',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        modelName: 'gpt-4'
      }
    ]
  });
});

// 智能体相关
app.get('/api/agents/:sessionId', (req, res) => {
  res.json({
    agents: [
      {
        id: 1,
        sessionId: parseInt(req.params.sessionId),
        characterId: 1,
        modelConfigId: 1
      },
      {
        id: 2,
        sessionId: parseInt(req.params.sessionId),
        characterId: 2,
        modelConfigId: 1
      }
    ]
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});