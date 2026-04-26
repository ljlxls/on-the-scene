require('dotenv').config();
const { LLMService } = require('./services/llmService');
const readline = require('readline');

const PROVIDERS = {
  deepseek: {
    name: 'DeepSeek',
    envKey: 'DEEPSEEK_API_KEY',
    defaultModel: 'deepseek-chat',
    description: 'DeepSeek官方API，新用户有免费额度'
  },
  moonshot: {
    name: 'Moonshot (月之暗面)',
    envKey: 'MOONSHOT_API_KEY',
    defaultModel: 'moonshot-v1-8k',
    description: '月之暗面Kimi API，有免费额度'
  },
  zhipu: {
    name: '智谱AI (GLM)',
    envKey: 'ZHIPU_API_KEY',
    defaultModel: 'glm-4-flash',
    description: '智谱清言API，免费额度较大'
  },
  groq: {
    name: 'Groq',
    envKey: 'GROQ_API_KEY',
    defaultModel: 'llama-3.3-70b-versatile',
    description: 'Groq免费快速推理，Llama模型'
  },
  openrouter: {
    name: 'OpenRouter',
    envKey: 'OPENROUTER_API_KEY',
    defaultModel: 'deepseek/deepseek-chat:free',
    description: 'OpenRouter聚合平台，有免费模型'
  }
};

async function testLLMConnection(provider, apiKey, model) {
  console.log(`\n🔍 测试 ${PROVIDERS[provider].name} 连接...`);
  console.log(`   模型: ${model}`);
  
  const llmService = new LLMService({
    provider: provider,
    apiKey: apiKey,
    model: model
  });

  const testMessages = [
    {
      role: 'system',
      content: '你是一个友好的AI助手。请用简短的中文回复。'
    },
    {
      role: 'user',
      content: '你好！请用一句话介绍你自己。'
    }
  ];

  try {
    const startTime = Date.now();
    const response = await llmService.chat(testMessages);
    const elapsed = Date.now() - startTime;
    
    console.log(`\n✅ 连接成功！耗时: ${elapsed}ms`);
    console.log(`\n📝 模型回复:`);
    console.log(`   ${response.content}`);
    console.log(`\n📊 Token使用: 输入=${response.usage?.prompt_tokens || 'N/A'}, 输出=${response.usage?.completion_tokens || 'N/A'}`);
    
    return { success: true, response, elapsed };
  } catch (error) {
    console.log(`\n❌ 连接失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testNovelAnalysis(provider, apiKey, model) {
  console.log(`\n\n🎭 测试小说分析功能...`);
  
  const llmService = new LLMService({
    provider: provider,
    apiKey: apiKey,
    model: model
  });

  const analysisPrompt = `你是一个专业的小说分析师。请分析以下小说片段，提取出主要角色信息。

小说片段：
---
李明是一个普通的上班族，每天朝九晚五。这天，他在地铁上遇到了多年未见的老同学张华。
"李明？真的是你吗？"张华惊喜地叫道。
李明抬头，看到一个穿着时尚的女子，一时没认出来。
"我是张华啊，高中同桌！"
"张华？天哪，你变化太大了！"李明惊讶地说。
旁边一位白发苍苍的老者微微一笑，继续看着手中的报纸。
---

请以JSON格式返回角色列表，格式如下：
{
  "characters": [
    {
      "name": "角色名",
      "description": "角色描述",
      "role": "主角/配角/路人"
    }
  ]
}`;

  try {
    const startTime = Date.now();
    const response = await llmService.chat([
      { role: 'user', content: analysisPrompt }
    ]);
    const elapsed = Date.now() - startTime;
    
    console.log(`\n✅ 分析完成！耗时: ${elapsed}ms`);
    console.log(`\n📝 分析结果:`);
    console.log(response.content);
    
    return { success: true, response, elapsed };
  } catch (error) {
    console.log(`\n❌ 分析失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function interactiveChat(provider, apiKey, model) {
  const llmService = new LLMService({
    provider: provider,
    apiKey: apiKey,
    model: model
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n💬 进入交互聊天模式 (输入 "exit" 退出)');
  console.log('─'.repeat(50));

  const messages = [
    {
      role: 'system',
      content: '你是一个友好的AI助手，可以帮助用户进行角色扮演和小说创作。'
    }
  ];

  const chat = () => {
    rl.question('\n你: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('再见！');
        rl.close();
        return;
      }

      messages.push({ role: 'user', content: input });

      try {
        const response = await llmService.chat(messages);
        console.log(`\nAI: ${response.content}`);
        messages.push({ role: 'assistant', content: response.content });
      } catch (error) {
        console.log(`\n错误: ${error.message}`);
      }

      chat();
    });
  };

  chat();
}

function printUsage() {
  console.log('\n📚 大模型API测试工具');
  console.log('═'.repeat(50));
  console.log('\n用法: node test-llm.js <provider> [command]');
  console.log('\n支持的Provider:');
  
  Object.entries(PROVIDERS).forEach(([key, info]) => {
    console.log(`  ${key.padEnd(12)} - ${info.name}`);
    console.log(`              ${info.description}`);
    console.log(`              环境变量: ${info.envKey}`);
    console.log(`              默认模型: ${info.defaultModel}`);
    console.log('');
  });

  console.log('命令:');
  console.log('  test      - 测试API连接');
  console.log('  analyze   - 测试小说分析功能');
  console.log('  chat      - 进入交互聊天模式');
  console.log('\n示例:');
  console.log('  node test-llm.js deepseek test');
  console.log('  node test-llm.js groq chat');
  console.log('  node test-llm.js zhipu analyze');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    printUsage();
    return;
  }

  const provider = args[0].toLowerCase();
  const command = args[1] || 'test';
  const model = args[2] || PROVIDERS[provider]?.defaultModel;

  if (!PROVIDERS[provider]) {
    console.log(`❌ 不支持的provider: ${provider}`);
    console.log('支持的provider: ' + Object.keys(PROVIDERS).join(', '));
    return;
  }

  const envKey = PROVIDERS[provider].envKey;
  const apiKey = process.env[envKey];

  if (!apiKey) {
    console.log(`\n❌ 未找到API密钥！`);
    console.log(`请在 .env 文件中设置 ${envKey}=your_api_key`);
    console.log(`\n获取API密钥:`);
    
    const keyUrls = {
      deepseek: 'https://platform.deepseek.com/',
      moonshot: 'https://platform.moonshot.cn/',
      zhipu: 'https://open.bigmodel.cn/',
      groq: 'https://console.groq.com/',
      openrouter: 'https://openrouter.ai/'
    };
    
    console.log(`  ${PROVIDERS[provider].name}: ${keyUrls[provider]}`);
    return;
  }

  switch (command) {
    case 'test':
      await testLLMConnection(provider, apiKey, model);
      break;
    case 'analyze':
      await testNovelAnalysis(provider, apiKey, model);
      break;
    case 'chat':
      await interactiveChat(provider, apiKey, model);
      break;
    default:
      console.log(`未知命令: ${command}`);
      printUsage();
  }
}

main().catch(console.error);
