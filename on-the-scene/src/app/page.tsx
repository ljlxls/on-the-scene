import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold text-accent">🎭 亲临其境</div>
          <div className="flex gap-4 items-center">
            <a 
              href="/index.html" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              产品介绍
            </a>
            <Link 
              href="/upload" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              上传小说
            </Link>
            <Link 
              href="/settings" 
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors"
            >
              配置API
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient min-h-[70vh] flex items-center justify-center pt-16">
        <div className="text-center px-4">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-accent text-sm">🎉 新版本 v1.0.0 发布</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            亲临其境
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            上传小说，让AI分析并生成角色，创建沉浸式的角色扮演体验
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/upload"
              className="bg-accent text-primary font-bold py-3 px-8 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              🚀 开始体验
            </Link>
            <a
              href="/index.html"
              className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors"
            >
              📖 了解更多
            </a>
          </div>
          
          {/* Stats */}
          <div className="flex gap-8 justify-center mt-12 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">3+</div>
              <div className="text-sm text-gray-400">支持的大模型API</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">∞</div>
              <div className="text-sm text-gray-400">无限角色扮演</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">100%</div>
              <div className="text-sm text-gray-400">开源免费</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">
            核心功能
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            基于OpenMAIC成熟架构，为角色扮演场景深度优化
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="📚"
              title="小说智能分析"
              description="上传PDF或TXT格式小说，AI自动分析并提取世界观、角色、情节等核心元素。"
            />
            <FeatureCard
              icon="🌍"
              title="世界观构建"
              description="自动生成小说世界的背景、规则、地理环境、社会结构等完整世界观设定。"
            />
            <FeatureCard
              icon="🎭"
              title="角色智能体生成"
              description="每个角色拥有独立的灵魂文件、记忆系统和行为习惯，保持角色一致性。"
            />
            <FeatureCard
              icon="🎬"
              title="导演智能体"
              description="上帝之手智能体负责叙述故事、推进剧情、协调多角色互动。"
            />
            <FeatureCard
              icon="🔄"
              title="动态角色切换"
              description="用户可以在不同角色间自由切换，体验不同视角的故事发展。"
            />
            <FeatureCard
              icon="💬"
              title="沉浸式互动"
              description="与AI角色实时对话，你的每一个选择都会影响故事走向。"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">
            使用指南
          </h2>
          <p className="text-gray-400 text-center mb-12">
            简单四步，开启你的角色扮演之旅
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <StepCard
              number={1}
              title="配置API密钥"
              description="在设置页面配置你的大模型API密钥（支持Groq、DeepSeek等免费API）"
            />
            <StepCard
              number={2}
              title="上传小说"
              description="上传TXT格式的小说文件，AI将自动分析并提取世界观和角色信息"
            />
            <StepCard
              number={3}
              title="选择角色"
              description="浏览AI提取的角色列表，选择你想扮演的角色"
            />
            <StepCard
              number={4}
              title="开始扮演"
              description="输入你的行动或对话，与AI角色互动，推进故事发展"
            />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">技术栈</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <TechBadge>⚛️ React 19</TechBadge>
            <TechBadge>🔷 Next.js 15</TechBadge>
            <TechBadge>🎨 Tailwind CSS</TechBadge>
            <TechBadge>🐻 Zustand</TechBadge>
            <TechBadge>🤖 LangGraph</TechBadge>
            <TechBadge>⚡ Groq API</TechBadge>
            <TechBadge>🧠 DeepSeek</TechBadge>
            <TechBadge>💾 IndexedDB</TechBadge>
            <TechBadge>📘 TypeScript</TechBadge>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-blue-900 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">准备好开始了吗？</h2>
          <p className="text-gray-200 mb-8">上传你的小说，开启沉浸式角色扮演体验</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/upload"
              className="bg-accent text-primary font-bold py-3 px-8 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              🚀 立即开始
            </Link>
            <a
              href="https://gitee.com/ddxydbl/on-the-scene"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors"
            >
              📦 查看源码
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center gap-8 mb-4">
            <a href="/index.html" className="text-gray-400 hover:text-white transition-colors">产品介绍</a>
            <a href="https://gitee.com/ddxydbl/on-the-scene" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Gitee</a>
            <a href="https://gitee.com/ddxydbl/on-the-scene/issues" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">问题反馈</a>
          </div>
          <div className="text-center text-gray-400">
            <p>亲临其境 - AI角色扮演游戏应用</p>
            <p className="mt-2 text-sm">
              基于 OpenMAIC 架构开发 · MIT License
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card-hover bg-gray-900/50 p-6 rounded-xl border border-gray-800">
      <div className="w-14 h-14 bg-primary/30 rounded-xl flex items-center justify-center text-2xl mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
      <div className="w-10 h-10 bg-accent text-primary font-bold rounded-full flex items-center justify-center flex-shrink-0">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

function TechBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-full px-4 py-2 text-sm text-gray-300 hover:border-primary/50 transition-colors">
      {children}
    </div>
  );
}
