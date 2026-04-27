import { NextResponse } from 'next/server';
import { storageService } from '@/lib/storage/storage-service';
import { LLMConfig, LLMProvider, LLM_PROVIDERS } from '@/lib/types';

export async function GET() {
  try {
    await storageService.init();
    const configs = await storageService.getAllModelConfigs();
    return NextResponse.json({ configs, providers: LLM_PROVIDERS });
  } catch (error) {
    console.error('Failed to get model configs:', error);
    return NextResponse.json({ error: 'Failed to get model configs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await storageService.init();
    
    const body = await request.json();
    const { provider, apiKey, endpoint, modelName } = body;
    
    const providerInfo = LLM_PROVIDERS.find(p => p.id === provider);
    if (!providerInfo) {
      return NextResponse.json({ error: '未知的提供商' }, { status: 400 });
    }
    
    if (providerInfo.requiresApiKey && !apiKey) {
      return NextResponse.json({ error: '该提供商需要API密钥' }, { status: 400 });
    }
    
    const config: LLMConfig & { id: string } = {
      id: 'default',
      provider: provider as LLMProvider,
      apiKey: apiKey || 'local',
      endpoint: endpoint || providerInfo.defaultEndpoint,
      modelName: modelName || providerInfo.defaultModel
    };
    
    await storageService.saveModelConfig(config);
    
    return NextResponse.json({ 
      id: config.id, 
      provider: config.provider,
      message: '配置保存成功'
    });
  } catch (error) {
    console.error('Failed to save model config:', error);
    return NextResponse.json({ error: 'Failed to save model config' }, { status: 500 });
  }
}
