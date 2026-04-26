'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Character, ChatMessage } from '@/lib/types';

interface Message extends ChatMessage {
  characterName?: string;
  characterAvatar?: string;
  characterColor?: string;
}

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const [storyId, setStoryId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [userCharacter, setUserCharacter] = useState<Character | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then(p => setStoryId(p.id));
  }, [params]);

  useEffect(() => {
    if (!storyId) return;

    const fetchStory = async () => {
      try {
        const response = await fetch(`/api/stories/${storyId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '加载失败');
        }

        setMessages(data.messages || []);
        setCharacters(data.characters || []);
        
        const uc = data.characters.find(
          (c: Character) => c.id === data.story.userCharacterId
        );
        setUserCharacter(uc || null);
      } catch (err) {
        console.error('Failed to load story:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          message: userMessage,
          characterId: userCharacter?.id
        })
      });

      if (!response.ok) {
        throw new Error('发送失败');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let currentAgentId = '';
      let currentContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          try {
            const event = JSON.parse(data);

            switch (event.type) {
              case 'user_message':
                setMessages(prev => [...prev, event.data]);
                break;

              case 'agent_start':
                currentAgentId = event.data.agentId;
                currentContent = '';
                const char = characters.find(c => c.id === currentAgentId);
                setMessages(prev => [...prev, {
                  id: `temp-${Date.now()}`,
                  storyId,
                  characterId: currentAgentId,
                  content: '',
                  type: 'character',
                  characterName: event.data.agentName,
                  characterAvatar: event.data.agentAvatar,
                  characterColor: event.data.agentColor,
                  createdAt: new Date()
                }]);
                break;

              case 'text_delta':
                currentContent += event.data.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.characterId === currentAgentId) {
                    lastMessage.content = currentContent;
                  }
                  return newMessages;
                });
                break;

              case 'agent_end':
                currentAgentId = '';
                break;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white">
          ← 返回
        </Link>
        <h1 className="text-lg font-bold text-white flex-1">
          {userCharacter ? `扮演: ${userCharacter.name}` : '角色扮演'}
        </h1>
      </header>

      {/* Character Bar */}
      <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-2 flex gap-2 overflow-x-auto">
        {characters.map((char) => (
          <div
            key={char.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              char.id === userCharacter?.id
                ? 'bg-accent text-primary'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            <span>{char.appearance.avatar}</span>
            <span>{char.name}</span>
            {char.id === userCharacter?.id && (
              <span className="text-xs opacity-70">(你)</span>
            )}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p>故事即将开始...</p>
            <p className="text-sm mt-2">输入你的第一个行动或对话</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex gap-3 ${
              msg.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.type !== 'user' && (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: (msg.characterColor || '#1a237e') + '40' }}
              >
                {msg.characterAvatar || '🎭'}
              </div>
            )}

            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.type === 'user'
                  ? 'message-user text-white'
                  : msg.type === 'narrator'
                  ? 'message-narrator text-gray-200'
                  : 'message-character text-white'
              }`}
            >
              {msg.type !== 'user' && msg.characterName && (
                <div className="text-xs text-gray-400 mb-1">{msg.characterName}</div>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>

            {msg.type === 'user' && userCharacter && (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: userCharacter.appearance.color + '40' }}
              >
                {userCharacter.appearance.avatar}
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="message-character rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-900/80 border-t border-gray-800 px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="输入你的行动或对话..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </div>
    </main>
  );
}
