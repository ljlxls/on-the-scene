export interface CharacterAppearance {
  description: string;
  avatar: string;
  color: string;
}

export interface CharacterRelationship {
  targetId: string;
  type: string;
  description: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  persona: string;
  avatar: string;
  color: string;
  allowedActions: string[];
  priority: number;
  soulFile: SoulFile;
  isUserControlled: boolean;
  isGenerated: boolean;
}

export interface Character {
  id: string;
  novelId: string;
  name: string;
  aliases: string[];
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  importance: number;
  appearance: CharacterAppearance;
  personality: string[];
  background: string;
  motivations: string[];
  fears: string[];
  values: string[];
  abilities: string[];
  weaknesses: string[];
  relationships: CharacterRelationship[];
  agentConfig: AgentConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoulIdentity {
  name: string;
  role: string;
  coreTraits: string[];
}

export interface SoulPersonality {
  traits: string[];
  speechStyle: string;
  decisionStyle: string;
}

export interface SoulBackstory {
  origin: string;
  keyEvents: string[];
  secrets: string[];
}

export interface SoulMotivations {
  goals: string[];
  desires: string[];
  fears: string[];
}

export interface RelationshipInfo {
  type: string;
  attitude: string;
  history: string;
}

export interface TriggerCondition {
  condition: string;
  reaction: string;
}

export interface BehaviorRules {
  alwaysDo: string[];
  neverDo: string[];
  triggers: TriggerCondition[];
}

export interface SoulFile {
  characterId: string;
  identity: SoulIdentity;
  personality: SoulPersonality;
  backstory: SoulBackstory;
  motivations: SoulMotivations;
  relationships: Record<string, RelationshipInfo>;
  behaviorRules: BehaviorRules;
}

export interface ShortTermMemory {
  recentEvents: string[];
  currentGoal: string;
  activeEmotions: string[];
}

export interface LongTermMemory {
  importantEvents: string[];
  learnedLessons: string[];
  developedRelationships: string[];
}

export interface HabitPatterns {
  speechPatterns: string[];
  behavioralPatterns: string[];
  decisionPatterns: string[];
}

export interface MemoryFile {
  id: string;
  characterId: string;
  shortTerm: ShortTermMemory;
  longTerm: LongTermMemory;
  habits: HabitPatterns;
  createdAt: Date;
  updatedAt: Date;
}
