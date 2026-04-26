import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { storageService } from '@/lib/storage/storage-service';
import { Story, StoryScene } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await storageService.init();
    
    const { id } = await params;
    const story = await storageService.getStory(id);
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    const messages = await storageService.getChatMessagesByStory(id);
    const characters = await storageService.getCharactersByNovel(story.novelId);
    
    return NextResponse.json({
      story,
      messages,
      characters
    });
  } catch (error) {
    console.error('Failed to get story:', error);
    return NextResponse.json({ error: 'Failed to get story' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await storageService.init();
    
    const body = await request.json();
    const { novelId, userCharacterId } = body;
    
    if (!novelId || !userCharacterId) {
      return NextResponse.json({ 
        error: 'Novel ID and user character ID are required' 
      }, { status: 400 });
    }
    
    const novel = await storageService.getNovel(novelId);
    if (!novel) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    }
    
    const characters = await storageService.getCharactersByNovel(novelId);
    const userCharacter = characters.find(c => c.id === userCharacterId);
    
    if (!userCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    const initialScene: StoryScene = {
      id: nanoid(),
      storyId: '',
      type: 'narration',
      title: '故事开始',
      description: `${novel.title}的故事即将开始。你将扮演${userCharacter.name}，在这个世界中展开你的冒险。`,
      order: 1,
      location: '未知地点',
      presentCharacters: characters.slice(0, 3).map(c => c.id),
      atmosphere: '神秘',
      objectives: [],
      events: [],
      createdAt: new Date()
    };
    
    const story: Story = {
      id: nanoid(),
      novelId,
      userCharacterId,
      scenes: [initialScene],
      currentSceneId: initialScene.id,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    initialScene.storyId = story.id;
    
    await storageService.saveStory(story);
    
    return NextResponse.json({
      id: story.id,
      status: story.status,
      initialScene,
      userCharacter
    });
  } catch (error) {
    console.error('Failed to create story:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
