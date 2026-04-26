import { Character } from './character';

export type SceneType = 
  | 'dialogue'
  | 'narration'
  | 'exploration'
  | 'conflict'
  | 'revelation'
  | 'transition';

export interface SceneObjective {
  type: 'information' | 'relationship' | 'conflict' | 'choice';
  description: string;
  completed: boolean;
}

export interface SceneEvent {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
}

export interface SceneChoice {
  id: string;
  text: string;
  consequences: string;
}

export interface StoryScene {
  id: string;
  storyId: string;
  type: SceneType;
  title: string;
  description: string;
  order: number;
  location: string;
  presentCharacters: string[];
  atmosphere: string;
  objectives: SceneObjective[];
  events: SceneEvent[];
  choices?: SceneChoice[];
  createdAt: Date;
}

export interface Story {
  id: string;
  novelId: string;
  userCharacterId: string;
  scenes: StoryScene[];
  currentSceneId: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  storyId: string;
  characterId: string | null;
  content: string;
  type: 'user' | 'character' | 'narrator';
  createdAt: Date;
}

export interface AgentResponse {
  agentId: string;
  agentName: string;
  content: string;
  actions: string[];
}
