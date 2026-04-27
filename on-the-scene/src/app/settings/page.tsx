'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LLMConfig, LLMProvider, LLM_PROVIDERS } from '@/lib/types';

export default function SettingsPage() {
  const [provider, setProvider] = useState<LLMProvider>('groq');
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [modelName, setModelName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const currentProvider = LLM_PROVIDERS.find(p => p.id === provider);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/models');
        const data = await response.json();
        
        if (data.configs && data.configs.length > 0) {
          const config = data.configs[0];
          setProvider(config.provider);
          setApiKey(config.apiKey || '');
          setEndpoint(config.endpoint || '');
          setModelName(config.modelName);
        }
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    if (currentProvider) {
      setEndpoint(currentProvider.defaultEndpoint);
      setModelName(currentProvider.defaultModel);
    }
  }, [provider, currentProvider]);

  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    setTestResult(null);
    const providerInfo = LLM_PROVIDERS.find(p => p.id === newProvider);
    if (providerInfo) {
      setEndpoint(providerInfo.defaultEndpoint);
      setModelName(providerInfo.defaultModel);
    }
  };

  const handleSave = async () => {
    if (!currentProvider?.requiresApiKey && !apiKey) {
      // 本地模型不需要API密钥
    } else if (currentProvider?.requiresApiKey && !apiKey.trim()) {
      setError('请输入API密钥');
      return;
    }

    setSaving(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKey || 'local',
          endpoint,
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

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/models/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKey || 'local',
          endpoint,
          modelName
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult('✅ 连接成功！模型响应正常');
      } else {
        setTestResult(`❌ 连接失败: ${data.error || '未知错误'}`);
      }
    } catch (err) {
      setTestResult(`❌ 连接失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setTesting(false);
    }
  };

  const cloudProviders = LLM_PROVIDERS.filter(p => !p.isLocal);
  const localProviders = LLM_PROVIDERS.filter(p => p.isLocal);

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-white mb-8 inline-block">
          ← 返回首页
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">大模型配置</h1>

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

        {/* 云端模型 */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            ☁️ 云端模型
          </h2>

          <div className="space-y-2">
            {cloudProviders.map((p) => (
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
                <div className="flex-1">
                  <div className="text-white font-medium">{p.name}</div>
                  <div className="text-gray-400 text-sm">{p.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 本地模型 */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            💻 本地模型
          </h2>

          <div className="space-y-2">
            {localProviders.map((p) => (
              <label
                key={p.id}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  provider === p.id
                    ? 'border-accent bg-accent/10'
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
                  provider === p.id ? 'border-accent bg-accent' : 'border-gray-500'
                }`} />
                <div className="flex-1">
                  <div className="text-white font-medium">{p.name}</div>
                  <div className="text-gray-400 text-sm">{p.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 配置详情 */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">配置详情</h2>

          <div className="space-y-4">
            {currentProvider?.requiresApiKey && (
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
            )}

            <div>
              <label className="block text-gray-300 mb-2">API端点</label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="API端点地址"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
              <p className="text-gray-500 text-sm mt-1">
                {currentProvider?.isLocal 
                  ? '本地模型默认端点，可根据实际情况修改' 
                  : '默认使用官方端点，一般无需修改'}
              </p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">模型名称</label>
              {currentProvider?.models && currentProvider.models.length > 0 ? (
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                >
                  {currentProvider.models.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  <option value="custom">自定义模型...</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="输入模型名称"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                />
              )}
              {currentProvider?.isLocal && (
                <p className="text-gray-500 text-sm mt-1">
                  {currentProvider.id === 'ollama' && '使用 ollama list 命令查看已安装的模型'}
                  {currentProvider.id === 'lmstudio' && '在 LM Studio 中加载模型后使用'}
                  {currentProvider.id === 'llamacpp' && '启动 llama.cpp 服务器后使用'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div className={`p-4 rounded-lg mb-6 ${
            testResult.startsWith('✅') 
              ? 'bg-green-900/50 border border-green-500 text-green-200' 
              : 'bg-red-900/50 border border-red-500 text-red-200'
          }`}>
            {testResult}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex-1 border-2 border-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {testing ? '测试中...' : '🔍 测试连接'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '💾 保存配置'}
          </button>
        </div>

        {/* 帮助信息 */}
        <div className="mt-8 bg-gray-900/30 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">获取API密钥</h2>
          
          <div className="grid md:grid-cols-2 gap-4 text-gray-400">
            <div>
              <h3 className="text-white font-medium mb-1">Groq (推荐)</h3>
              <p className="text-sm mb-1">免费、速度快</p>
              <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">https://console.groq.com/</a>
            </div>

            <div>
              <h3 className="text-white font-medium mb-1">DeepSeek</h3>
              <p className="text-sm mb-1">新用户免费额度</p>
              <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">https://platform.deepseek.com/</a>
            </div>

            <div>
              <h3 className="text-white font-medium mb-1">智谱清言</h3>
              <p className="text-sm mb-1">国内大模型，免费额度大</p>
              <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">https://open.bigmodel.cn/</a>
            </div>

            <div>
              <h3 className="text-white font-medium mb-1">硅基流动</h3>
              <p className="text-sm mb-1">多种开源模型</p>
              <a href="https://cloud.siliconflow.cn/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">https://cloud.siliconflow.cn/</a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-white font-medium mb-3">本地模型使用指南</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <span className="text-white">Ollama:</span>
                <code className="ml-2 bg-gray-800 px-2 py-1 rounded">ollama serve</code>
                <span className="ml-2">然后运行</span>
                <code className="ml-2 bg-gray-800 px-2 py-1 rounded">ollama run llama3.2</code>
              </div>
              <div>
                <span className="text-white">LM Studio:</span>
                <span className="ml-2">下载并运行 LM Studio，加载模型后启动本地服务器</span>
              </div>
              <div>
                <span className="text-white">llama.cpp:</span>
                <code className="ml-2 bg-gray-800 px-2 py-1 rounded">./llama-server -m model.gguf --port 8080</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
