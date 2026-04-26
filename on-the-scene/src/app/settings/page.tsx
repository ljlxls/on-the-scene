'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ModelConfig {
  id: string;
  provider: string;
  apiKey: string;
  endpoint?: string;
  modelName: string;
}

const PROVIDERS = [
  { id: 'groq', name: 'Groq (推荐)', description: '免费、速度快、Llama模型', defaultModel: 'llama-3.3-70b-versatile' },
  { id: 'deepseek', name: 'DeepSeek', description: '新用户免费额度、国内访问稳定', defaultModel: 'deepseek-chat' },
  { id: 'openai', name: 'OpenAI', description: 'GPT系列模型', defaultModel: 'gpt-3.5-turbo' }
];

export default function SettingsPage() {
  const [provider, setProvider] = useState('groq');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('llama-3.3-70b-versatile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/models');
        const data = await response.json();
        
        if (data.configs && data.configs.length > 0) {
          const config = data.configs[0];
          setProvider(config.provider);
          setApiKey(config.apiKey);
          setModelName(config.modelName);
        }
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };

    loadConfig();
  }, []);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const providerInfo = PROVIDERS.find(p => p.id === newProvider);
    if (providerInfo) {
      setModelName(providerInfo.defaultModel);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('请输入API密钥');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          modelName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '保存失败');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-white mb-8 inline-block">
          ← 返回首页
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">设置</h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
            保存成功！
          </div>
        )}

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">大模型API配置</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">选择提供商</label>
              <div className="space-y-2">
                {PROVIDERS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      provider === p.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value={p.id}
                      checked={provider === p.id}
                      onChange={() => handleProviderChange(p.id)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      provider === p.id ? 'border-primary bg-primary' : 'border-gray-500'
                    }`} />
                    <div>
                      <div className="text-white font-medium">{p.name}</div>
                      <div className="text-gray-400 text-sm">{p.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">API密钥</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入你的API密钥"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">模型名称</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="模型名称"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存配置'}
        </button>

        <div className="mt-8 bg-gray-900/30 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">获取API密钥</h2>
          
          <div className="space-y-4 text-gray-400">
            <div>
              <h3 className="text-white font-medium mb-1">Groq (推荐)</h3>
              <p className="text-sm mb-1">免费、速度快、支持Llama等模型</p>
              <a 
                href="https://console.groq.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                https://console.groq.com/
              </a>
            </div>

            <div>
              <h3 className="text-white font-medium mb-1">DeepSeek</h3>
              <p className="text-sm mb-1">新用户有免费额度，国内访问稳定</p>
              <a 
                href="https://platform.deepseek.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                https://platform.deepseek.com/
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
