import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { storageService } from '@/lib/storage/storage-service';
import { Novel } from '@/lib/types';

export async function GET() {
  try {
    await storageService.init();
    const novels = await storageService.getAllNovels();
    return NextResponse.json({ novels });
  } catch (error) {
    console.error('Failed to get novels:', error);
    return NextResponse.json({ error: 'Failed to get novels' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await storageService.init();
    
    const body = await request.json();
    const { title, content } = body;
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const novel: Novel = {
      id: nanoid(),
      title,
      content,
      status: 'uploaded',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await storageService.saveNovel(novel);
    
    return NextResponse.json({ id: novel.id, status: novel.status });
  } catch (error) {
    console.error('Failed to create novel:', error);
    return NextResponse.json({ error: 'Failed to create novel' }, { status: 500 });
  }
}
