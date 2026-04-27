import { NextRequest, NextResponse } from 'next/server';
import { LLMConfig, LLM_PROVIDERS } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, apiKey, endpoint, modelName } = body;

    const providerInfo = LLM_PROVIDERS.find(p => p.id === provider);
    if (!providerInfo) {
      return NextResponse.json({ error: '未知的提供商' }, { status: 400 });
    }

    const config: LLMConfig = {
      provider,
      apiKey: apiKey || 'local',
      endpoint: endpoint || providerInfo.defaultEndpoint,
      modelName: modelName || providerInfo.defaultModel
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (config.apiKey && !providerInfo.isLocal) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const testMessages = [
      { role: 'user' as const, content: '你好，请回复"连接成功"' }
    ];

    try {
      const response = await fetch(config.endpoint!, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.modelName,
          messages: testMessages,
          max_tokens: 50
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({ 
          error: `API错误: ${response.status} - ${JSON.stringify(errorData)}` 
        }, { status: 400 });
      }

      const data = await response.json();
      
      return NextResponse.json({ 
        success: true, 
        message: '连接成功',
        model: config.modelName,
        response: data.choices?.[0]?.message?.content || '已收到响应'
      });
    } catch (fetchError) {
      if (providerInfo.isLocal) {
        return NextResponse.json({ 
          error: `无法连接到本地服务。请确保${providerInfo.name}正在运行。\n端点: ${config.endpoint}` 
        }, { status: 400 });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '测试连接失败' 
    }, { status: 500 });
  }
}
