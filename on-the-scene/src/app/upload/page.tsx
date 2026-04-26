'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [novelId, setNovelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent(text);
      };
      reader.readAsText(selectedFile);
    }
  }, []);

  const handleUpload = async () => {
    if (!title || !content) {
      setError('请输入小说标题和内容');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '上传失败');
      }

      setNovelId(data.id);
      setUploading(false);
      setAnalyzing(true);

      const analyzeResponse = await fetch(`/api/novels/${data.id}/analysis`, {
        method: 'POST'
      });

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok) {
        throw new Error(analyzeData.error || '分析失败');
      }

      router.push(`/novel/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-white mb-8 inline-block">
          ← 返回首页
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">上传小说</h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
          <label className="block mb-4">
            <span className="text-gray-300 mb-2 block">选择小说文件 (TXT)</span>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-primary/80"
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-300 mb-2 block">小说标题</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入小说标题"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <span className="text-gray-300 mb-2 block">小说内容</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="粘贴小说内容或上传文件"
              rows={10}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
            />
          </label>
        </div>

        {uploading || analyzing ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-white font-medium">
                  {uploading ? '上传中...' : '分析中...'}
                </p>
                <p className="text-gray-400 text-sm">
                  {uploading ? '正在保存小说' : 'AI正在分析小说，提取世界观和角色信息'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleUpload}
            disabled={!title || !content}
            className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上传并分析
          </button>
        )}

        <div className="mt-8 bg-gray-900/30 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">提示</h2>
          <ul className="text-gray-400 space-y-2">
            <li>• 支持 TXT 格式的小说文件</li>
            <li>• 小说内容越长，分析结果越准确</li>
            <li>• 分析过程可能需要1-2分钟</li>
            <li>• 请确保已在设置页配置API密钥</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
