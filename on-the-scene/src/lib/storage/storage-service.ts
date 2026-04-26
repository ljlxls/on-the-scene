import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Novel, WorldSetting, StoryOutline } from '../types/novel';
import { Character, MemoryFile } from '../types/character';
import { Story, StoryScene, ChatMessage } from '../types/story';
import { LLMConfig } from '../types';

interface OnTheSceneDB extends DBSchema {
  novels: {
    key: string;
    value: Novel;
    indexes: { 'by-status': string };
  };
  worldSettings: {
    key: string;
    value: WorldSetting;
    indexes: { 'by-novel': string };
  };
  characters: {
    key: string;
    value: Character;
    indexes: { 'by-novel': string };
  };
  stories: {
    key: string;
    value: Story;
    indexes: { 'by-novel': string };
  };
  chatMessages: {
    key: string;
    value: ChatMessage;
    indexes: { 'by-story': string };
  };
  memoryFiles: {
    key: string;
    value: MemoryFile;
    indexes: { 'by-character': string };
  };
  modelConfigs: {
    key: string;
    value: LLMConfig;
  };
}

const DB_NAME = 'on-the-scene';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<OnTheSceneDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<OnTheSceneDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<OnTheSceneDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('novels')) {
        const novelStore = db.createObjectStore('novels', { keyPath: 'id' });
        novelStore.createIndex('by-status', 'status');
      }
      
      if (!db.objectStoreNames.contains('worldSettings')) {
        const worldStore = db.createObjectStore('worldSettings', { keyPath: 'id' });
        worldStore.createIndex('by-novel', 'novelId');
      }
      
      if (!db.objectStoreNames.contains('characters')) {
        const charStore = db.createObjectStore('characters', { keyPath: 'id' });
        charStore.createIndex('by-novel', 'novelId');
      }
      
      if (!db.objectStoreNames.contains('stories')) {
        const storyStore = db.createObjectStore('stories', { keyPath: 'id' });
        storyStore.createIndex('by-novel', 'novelId');
      }
      
      if (!db.objectStoreNames.contains('chatMessages')) {
        const msgStore = db.createObjectStore('chatMessages', { keyPath: 'id' });
        msgStore.createIndex('by-story', 'storyId');
      }
      
      if (!db.objectStoreNames.contains('memoryFiles')) {
        const memStore = db.createObjectStore('memoryFiles', { keyPath: 'id' });
        memStore.createIndex('by-character', 'characterId');
      }
      
      if (!db.objectStoreNames.contains('modelConfigs')) {
        db.createObjectStore('modelConfigs', { keyPath: 'id' });
      }
    },
  });
  
  return dbInstance;
}

export class StorageService {
  private db: IDBPDatabase<OnTheSceneDB> | null = null;
  
  async init() {
    this.db = await getDB();
  }
  
  private ensureDB(): IDBPDatabase<OnTheSceneDB> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }
  
  // Novel operations
  async saveNovel(novel: Novel): Promise<void> {
    const db = this.ensureDB();
    await db.put('novels', novel);
  }
  
  async getNovel(id: string): Promise<Novel | undefined> {
    const db = this.ensureDB();
    return db.get('novels', id);
  }
  
  async getAllNovels(): Promise<Novel[]> {
    const db = this.ensureDB();
    return db.getAll('novels');
  }
  
  async updateNovelStatus(id: string, status: Novel['status']): Promise<void> {
    const db = this.ensureDB();
    const novel = await db.get('novels', id);
    if (novel) {
      novel.status = status;
      novel.updatedAt = new Date();
      await db.put('novels', novel);
    }
  }
  
  async deleteNovel(id: string): Promise<void> {
    const db = this.ensureDB();
    await db.delete('novels', id);
  }
  
  // WorldSetting operations
  async saveWorldSetting(worldSetting: WorldSetting): Promise<void> {
    const db = this.ensureDB();
    await db.put('worldSettings', worldSetting);
  }
  
  async getWorldSettingByNovel(novelId: string): Promise<WorldSetting | undefined> {
    const db = this.ensureDB();
    return db.getFromIndex('worldSettings', 'by-novel', novelId);
  }
  
  // Character operations
  async saveCharacter(character: Character): Promise<void> {
    const db = this.ensureDB();
    await db.put('characters', character);
  }
  
  async getCharactersByNovel(novelId: string): Promise<Character[]> {
    const db = this.ensureDB();
    return db.getAllFromIndex('characters', 'by-novel', novelId);
  }
  
  async getCharacter(id: string): Promise<Character | undefined> {
    const db = this.ensureDB();
    return db.get('characters', id);
  }
  
  // Story operations
  async saveStory(story: Story): Promise<void> {
    const db = this.ensureDB();
    await db.put('stories', story);
  }
  
  async getStory(id: string): Promise<Story | undefined> {
    const db = this.ensureDB();
    return db.get('stories', id);
  }
  
  async getStoriesByNovel(novelId: string): Promise<Story[]> {
    const db = this.ensureDB();
    return db.getAllFromIndex('stories', 'by-novel', novelId);
  }
  
  // ChatMessage operations
  async saveChatMessage(message: ChatMessage): Promise<void> {
    const db = this.ensureDB();
    await db.put('chatMessages', message);
  }
  
  async getChatMessagesByStory(storyId: string): Promise<ChatMessage[]> {
    const db = this.ensureDB();
    return db.getAllFromIndex('chatMessages', 'by-story', storyId);
  }
  
  // MemoryFile operations
  async saveMemoryFile(memoryFile: MemoryFile): Promise<void> {
    const db = this.ensureDB();
    await db.put('memoryFiles', memoryFile);
  }
  
  async getMemoryFileByCharacter(characterId: string): Promise<MemoryFile | undefined> {
    const db = this.ensureDB();
    return db.getFromIndex('memoryFiles', 'by-character', characterId);
  }
  
  // ModelConfig operations
  async saveModelConfig(config: LLMConfig & { id: string }): Promise<void> {
    const db = this.ensureDB();
    await db.put('modelConfigs', config);
  }
  
  async getModelConfig(id: string): Promise<(LLMConfig & { id: string }) | undefined> {
    const db = this.ensureDB();
    return db.get('modelConfigs', id);
  }
  
  async getAllModelConfigs(): Promise<(LLMConfig & { id: string })[]> {
    const db = this.ensureDB();
    return db.getAll('modelConfigs');
  }
}

export const storageService = new StorageService();
