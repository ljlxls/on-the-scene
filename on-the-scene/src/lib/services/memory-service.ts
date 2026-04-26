import { nanoid } from 'nanoid';
import { MemoryFile, ShortTermMemory, LongTermMemory, HabitPatterns } from '../types/character';

export function createInitialMemory(characterId: string, characterName: string): MemoryFile {
  return {
    id: nanoid(),
    characterId,
    shortTerm: {
      recentEvents: [],
      currentGoal: '',
      activeEmotions: []
    },
    longTerm: {
      importantEvents: [],
      learnedLessons: [],
      developedRelationships: []
    },
    habits: {
      speechPatterns: [],
      behavioralPatterns: [],
      decisionPatterns: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function updateShortTermMemory(
  memory: MemoryFile,
  event: string,
  emotion?: string
): MemoryFile {
  const recentEvents = [...memory.shortTerm.recentEvents, event].slice(-10);
  
  const activeEmotions = emotion
    ? [...new Set([...memory.shortTerm.activeEmotions, emotion])].slice(-5)
    : memory.shortTerm.activeEmotions;

  return {
    ...memory,
    shortTerm: {
      ...memory.shortTerm,
      recentEvents,
      activeEmotions
    },
    updatedAt: new Date()
  };
}

export function updateLongTermMemory(
  memory: MemoryFile,
  importantEvent: string
): MemoryFile {
  const isImportant = determineImportance(importantEvent);
  
  if (!isImportant) {
    return memory;
  }

  return {
    ...memory,
    longTerm: {
      ...memory.longTerm,
      importantEvents: [...memory.longTerm.importantEvents, importantEvent].slice(-20)
    },
    updatedAt: new Date()
  };
}

export function updateRelationship(
  memory: MemoryFile,
  targetCharacterId: string,
  relationshipUpdate: string
): MemoryFile {
  const existingRelationships = memory.longTerm.developedRelationships;
  
  const updatedRelationships = [
    ...existingRelationships.filter(r => !r.includes(targetCharacterId)),
    `${targetCharacterId}: ${relationshipUpdate}`
  ].slice(-10);

  return {
    ...memory,
    longTerm: {
      ...memory.longTerm,
      developedRelationships: updatedRelationships
    },
    updatedAt: new Date()
  };
}

export function setCurrentGoal(memory: MemoryFile, goal: string): MemoryFile {
  return {
    ...memory,
    shortTerm: {
      ...memory.shortTerm,
      currentGoal: goal
    },
    updatedAt: new Date()
  };
}

export function addHabitPattern(
  memory: MemoryFile,
  type: 'speech' | 'behavioral' | 'decision',
  pattern: string
): MemoryFile {
  const key = type === 'speech' ? 'speechPatterns' 
    : type === 'behavioral' ? 'behavioralPatterns' 
    : 'decisionPatterns';

  const existingPatterns = memory.habits[key];
  
  if (existingPatterns.includes(pattern)) {
    return memory;
  }

  return {
    ...memory,
    habits: {
      ...memory.habits,
      [key]: [...existingPatterns, pattern].slice(-10)
    },
    updatedAt: new Date()
  };
}

function determineImportance(event: string): boolean {
  const importantKeywords = [
    '重要', '关键', '决定', '发现', '改变', '冲突', '秘密', '真相',
    '死亡', '爱情', '背叛', '胜利', '失败', '承诺', '誓言'
  ];

  return importantKeywords.some(keyword => event.includes(keyword));
}

export function getRecentMemorySummary(memory: MemoryFile): string {
  const events = memory.shortTerm.recentEvents.slice(-3);
  const emotions = memory.shortTerm.activeEmotions;
  const goal = memory.shortTerm.currentGoal;

  let summary = '';
  
  if (events.length > 0) {
    summary += `最近发生：${events.join('；')}\n`;
  }
  
  if (emotions.length > 0) {
    summary += `当前情绪：${emotions.join('、')}\n`;
  }
  
  if (goal) {
    summary += `当前目标：${goal}`;
  }

  return summary;
}

export function getLongTermMemorySummary(memory: MemoryFile): string {
  const events = memory.longTerm.importantEvents.slice(-5);
  const lessons = memory.longTerm.learnedLessons.slice(-3);
  const relationships = memory.longTerm.developedRelationships.slice(-5);

  let summary = '';

  if (events.length > 0) {
    summary += `重要经历：${events.join('；')}\n`;
  }

  if (lessons.length > 0) {
    summary += `学到的教训：${lessons.join('；')}\n`;
  }

  if (relationships.length > 0) {
    summary += `重要关系：${relationships.join('；')}`;
  }

  return summary;
}
