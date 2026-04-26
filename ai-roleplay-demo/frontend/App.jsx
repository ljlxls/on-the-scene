function App() {
  const [activePage, setActivePage] = React.useState('home');
  const [novels, setNovels] = React.useState([]);
  const [selectedNovel, setSelectedNovel] = React.useState(null);
  const [analysisResult, setAnalysisResult] = React.useState(null);
  const [selectedCharacter, setSelectedCharacter] = React.useState(null);
  const [sessions, setSessions] = React.useState([]);
  const [currentSession, setCurrentSession] = React.useState(null);
  const [messageInput, setMessageInput] = React.useState('');

  // 模拟数据
  React.useEffect(() => {
    // 加载小说列表
    setNovels([
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
    ]);

    // 加载会话列表
    setSessions([
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
    ]);
  }, []);

  // 处理小说上传
  const handleNovelUpload = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const content = e.target.content.value;
    
    const newNovel = {
      id: novels.length + 1,
      title,
      content,
      status: 'uploaded',
      characters: []
    };
    
    setNovels([...novels, newNovel]);
    setSelectedNovel(newNovel);
    setActivePage('analysis');
  };

  // 处理小说分析
  const handleAnalyzeNovel = (novelId) => {
    const novel = novels.find(n => n.id === novelId);
    if (novel) {
      setSelectedNovel(novel);
      // 模拟分析结果
      setAnalysisResult({
        status: 'completed',
        progress: 100,
        characters: novel.characters
      });
      setActivePage('analysis');
    }
  };

  // 处理角色选择
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    // 创建新会话
    const newSession = {
      id: sessions.length + 1,
      novelId: selectedNovel.id,
      characterId: character.id,
      messages: [
        {
          id: 1,
          content: '故事开始了，你站在一个神秘的森林中。',
          type: 'system',
          senderId: null
        }
      ]
    };
    setSessions([...sessions, newSession]);
    setCurrentSession(newSession);
    setActivePage('roleplay');
  };

  // 处理消息发送
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentSession) return;
    
    const newMessage = {
      id: currentSession.messages.length + 1,
      content: messageInput,
      type: 'user',
      senderId: null
    };
    
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, newMessage]
    };
    
    // 模拟角色响应
    const characterResponse = {
      id: updatedSession.messages.length + 1,
      content: '配角1：这是一个模拟的响应。',
      type: 'character',
      senderId: 2
    };
    
    updatedSession.messages.push(characterResponse);
    setCurrentSession(updatedSession);
    setMessageInput('');
  };

  // 渲染首页
  const renderHomePage = () => (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-4">AI角色扮演应用</h1>
        <p className="text-center text-gray-600 mb-6">
          上传小说，选择角色，开始你的角色扮演之旅
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">上传小说</h2>
        <form onSubmit={handleNovelUpload} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">小说标题</label>
            <input 
              type="text" 
              name="title" 
              className="w-full px-4 py-2 border rounded-md" 
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">小说内容</label>
            <textarea 
              name="content" 
              rows="5" 
              className="w-full px-4 py-2 border rounded-md" 
              required
            ></textarea>
          </div>
          <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800">
            上传并分析
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">历史小说</h2>
        {novels.length > 0 ? (
          <ul className="space-y-4">
            {novels.map(novel => (
              <li key={novel.id} className="p-4 border rounded-md">
                <h3 className="font-bold">{novel.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  状态: {novel.status === 'analyzed' ? '已分析' : '已上传'}
                </p>
                <button 
                  onClick={() => handleAnalyzeNovel(novel.id)}
                  className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800"
                >
                  查看分析结果
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">暂无历史小说</p>
        )}
      </div>
    </div>
  );

  // 渲染小说分析页
  const renderAnalysisPage = () => (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">小说分析结果</h2>
        {analysisResult ? (
          <div>
            <div className="mb-6">
              <h3 className="font-bold">{selectedNovel?.title}</h3>
              <p className="text-gray-600">分析状态: {analysisResult.status}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-900 h-2.5 rounded-full" 
                  style={{ width: `${analysisResult.progress}%` }}
                ></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">角色列表</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisResult.characters.map(character => (
                  <div 
                    key={character.id} 
                    className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCharacterSelect(character)}
                  >
                    <h4 className="font-bold">{character.name}</h4>
                    <p className="text-gray-600 text-sm">{character.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">正在分析小说...</p>
        )}
      </div>
    </div>
  );

  // 渲染角色扮演页
  const renderRoleplayPage = () => (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">角色扮演</h2>
        {currentSession ? (
          <div>
            <div className="border rounded-md p-4 mb-4 h-96 overflow-y-auto">
              {currentSession.messages.map(message => (
                <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-100' : message.type === 'system' ? 'bg-gray-100' : 'bg-green-100'}`}>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex">
              <input 
                type="text" 
                value={messageInput} 
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-l-md"
                placeholder="输入你的对话..."
              />
              <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded-r-md hover:bg-blue-800">
                发送
              </button>
            </form>
          </div>
        ) : (
          <p className="text-gray-500">暂无会话</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <nav className="bg-blue-900 text-white p-4">
        <div className="container mx-auto flex space-x-4">
          <button 
            onClick={() => setActivePage('home')}
            className={`px-4 py-2 rounded-md ${activePage === 'home' ? 'bg-blue-800' : ''}`}
          >
            首页
          </button>
          <button 
            onClick={() => setActivePage('analysis')}
            className={`px-4 py-2 rounded-md ${activePage === 'analysis' ? 'bg-blue-800' : ''}`}
          >
            小说分析
          </button>
          <button 
            onClick={() => setActivePage('roleplay')}
            className={`px-4 py-2 rounded-md ${activePage === 'roleplay' ? 'bg-blue-800' : ''}`}
          >
            角色扮演
          </button>
        </div>
      </nav>
      <main className="py-8">
        {activePage === 'home' && renderHomePage()}
        {activePage === 'analysis' && renderAnalysisPage()}
        {activePage === 'roleplay' && renderRoleplayPage()}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));