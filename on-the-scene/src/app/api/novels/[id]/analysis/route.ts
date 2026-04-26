import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/storage/storage-service';
import { worldBuilderService } from '@/lib/services/world-builder';
import { characterGeneratorService } from '@/lib/services/character-gen';
import { llmService } from '@/lib/services/llm-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await storageService.init();
    
    const { id } = await params;
    
    const novel = await storageService.getNovel(id);
    if (!novel) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    }
    
    const worldSetting = await storageService.getWorldSettingByNovel(id);
    const characters = await storageService.getCharactersByNovel(id);
    
    if (!worldSetting || characters.length === 0) {
      return NextResponse.json({
        status: 'analyzing',
        progress: 0,
        message: 'Analysis not started'
      });
    }
    
    return NextResponse.json({
      status: 'completed',
      progress: 100,
      worldSetting,
      characters
    });
  } catch (error) {
    console.error('Failed to get analysis:', error);
    return NextResponse.json({ error: 'Failed to get analysis' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await storageService.init();
    
    const { id } = await params;
    
    const novel = await storageService.getNovel(id);
    if (!novel) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    }
    
    const modelConfig = await storageService.getModelConfig('default');
    if (!modelConfig) {
      return NextResponse.json({ 
        error: 'Model config not found. Please configure API key in Settings.' 
      }, { status: 400 });
    }
    
    llmService.setConfig(modelConfig);
    
    await storageService.updateNovelStatus(id, 'analyzing');
    
    const worldSetting = await worldBuilderService.buildWorld(novel.content, id);
    await storageService.saveWorldSetting(worldSetting);
    
    const characters = await characterGeneratorService.generateCharacters(
      novel.content,
      worldSetting,
      id
    );
    
    for (const character of characters) {
      await storageService.saveCharacter(character);
    }
    
    await storageService.updateNovelStatus(id, 'ready');
    
    return NextResponse.json({
      status: 'completed',
      progress: 100,
      worldSetting,
      characters
    });
  } catch (error) {
    console.error('Failed to analyze novel:', error);
    
    const { id } = await params;
    await storageService.updateNovelStatus(id, 'error');
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to analyze novel' 
    }, { status: 500 });
  }
}
