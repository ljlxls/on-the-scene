'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Character, WorldSetting } from '@/lib/types';

export default function NovelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [novelId, setNovelId] = useState<string>('');
  const [worldSetting, setWorldSetting] = useState<WorldSetting | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setNovelId(p.id));
  }, [params]);

  useEffect(() => {
    if (!novelId) return;

    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/novels/${novelId}/analysis`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '加载失败');
        }

        if (data.status === 'completed') {
          setWorldSetting(data.worldSetting);
          setCharacters(data.characters);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [novelId]);

  const handleStartPlay = async () => {
    if (!selectedCharacter) {
      alert('请选择要扮演的角色');
      return;
    }

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId,
          userCharacterId: selectedCharacter
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '创建失败');
      }

      router.push(`/play/${data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '创建失败');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">加载中...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-white mb-8 inline-block">
          ← 返回首页
        </Link>

        {/* World Setting */}
        {worldSetting && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">世界观</h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">世界名称：</span>
                  <span className="text-white">{worldSetting.worldName}</span>
                </div>
                <div>
                  <span className="text-gray-400">世界类型：</span>
                  <span className="text-white">{worldSetting.worldType}</span>
                </div>
                <div>
                  <span className="text-gray-400">时间背景：</span>
                  <span className="text-white">{worldSetting.timePeriod}</span>
                </div>
                <div>
                  <span className="text-gray-400">基调：</span>
                  <span className="text-white">{worldSetting.tone}</span>
                </div>
              </div>
              
              {worldSetting.mainConflict && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <span className="text-gray-400">主要冲突：</span>
                  <p className="text-white mt-1">{worldSetting.mainConflict}</p>
                </div>
              )}
              
              {worldSetting.themes.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-400">主题：</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {worldSetting.themes.map((theme, i) => (
                      <span key={i} className="bg-primary/30 text-white px-3 py-1 rounded-full text-sm">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Characters */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            角色列表 
            <span className="text-gray-400 text-lg font-normal ml-2">
              (点击选择你要扮演的角色)
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((character) => (
              <div
                key={character.id}
                onClick={() => setSelectedCharacter(character.id)}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                  selectedCharacter === character.id
                    ? 'border-accent bg-accent/10'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: character.appearance.color + '30' }}
                  >
                    {character.appearance.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{character.name}</h3>
                    <span className="text-sm text-gray-400">
                      {character.role === 'protagonist' ? '主角' : 
                       character.role === 'antagonist' ? '反派' : 
                       character.role === 'supporting' ? '配角' : '次要角色'}
                    </span>
                  </div>
                </div>
                
                {character.background && (
                  <p className="text-gray-400 text-sm line-clamp-2">{character.background}</p>
                )}
                
                {character.personality.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {character.personality.slice(0, 3).map((trait, i) => (
                      <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Start Button */}
        <button
          onClick={handleStartPlay}
          disabled={!selectedCharacter}
          className="w-full bg-accent text-primary font-bold py-4 px-6 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedCharacter ? '开始角色扮演' : '请先选择一个角色'}
        </button>
      </div>
    </main>
  );
}
