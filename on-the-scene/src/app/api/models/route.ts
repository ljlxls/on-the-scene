import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { storageService } from '@/lib/storage/storage-service';
import { LLMConfig } from '@/lib/types';

export async function GET() {
  try {
    await storageService.init();
    const configs = await storageService.getAllModelConfigs();
    return NextResponse.json({ configs });
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
    
    if (!provider || !apiKey) {
      return NextResponse.json({ 
        error: 'Provider and API key are required' 
      }, { status: 400 });
    }
    
    const config: LLMConfig & { id: string } = {
      id: 'default',
      provider,
      apiKey,
      endpoint,
      modelName: modelName || getDefaultModel(provider)
    };
    
    await storageService.saveModelConfig(config);
    
    return NextResponse.json({ id: config.id, provider: config.provider });
  } catch (error) {
    console.error('Failed to save model config:', error);
    return NextResponse.json({ error: 'Failed to save model config' }, { status: 500 });
  }
}

function getDefaultModel(provider: string): string {
  switch (provider) {
    case 'groq':
      return 'llama-3.3-70b-versatile';
    case 'deepseek':
      return 'deepseek-chat';
    case 'openai':
      return 'gpt-3.5-turbo';
    default:
      return '';
  }
}
