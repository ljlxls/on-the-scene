import { Character, SoulFile, MemoryFile } from '../types/character';
import { WorldSetting } from '../types/novel';
import { StoryScene } from '../types/story';
import { llmService } from '../services/llm-service';

export function buildCharacterPrompt(
  soulFile: SoulFile,
  worldSetting: WorldSetting,
  currentScene: StoryScene | null,
  memoryFile: MemoryFile | null
): string {
  const basePrompt = `# 角色身份
你是 ${soulFile.identity.name}，${soulFile.identity.role}。

## 核心特质
${soulFile.identity.coreTraits.join('、')}

## 性格特点
${soulFile.personality.traits.join('、')}

## 说话风格
${soulFile.personality.speechStyle}

## 决策风格
${soulFile.personality.decisionStyle}

## 背景故事
${soulFile.backstory.origin}
${soulFile.backstory.keyEvents.map(e => `- ${e}`).join('\n')}

## 动机
- 目标：${soulFile.motivations.goals.join('、')}
- 欲望：${soulFile.motivations.desires.join('、')}
- 恐惧：${soulFile.motivations.fears.join('、')}

## 行为准则
- 总是做：${soulFile.behaviorRules.alwaysDo.join('、')}
- 绝不做：${soulFile.behaviorRules.neverDo.join('、')}`;

  const worldContext = worldSetting ? `

## 世界背景
世界：${worldSetting.worldName}（${worldSetting.worldType}）
时代：${worldSetting.timePeriod}
主要冲突：${worldSetting.mainConflict}` : '';

  const sceneContext = currentScene ? `

## 当前场景
地点：${currentScene.location}
氛围：${currentScene.atmosphere}
在场角色：${currentScene.presentCharacters.join('、')}` : '';

  const memoryContext = memoryFile ? `

## 最近记忆
${memoryFile.shortTerm.recentEvents.slice(-3).map(e => `- ${e}`).join('\n')}

## 当前目标
${memoryFile.shortTerm.currentGoal}` : '';

  return `${basePrompt}${worldContext}${sceneContext}${memoryContext}

---
请根据以上信息，以 ${soulFile.identity.name} 的身份进行回应。
保持角色一致性，展现你的性格特点和说话风格。
回复时不要添加任何前缀或说明，直接以角色的口吻说话。`;
}

export function buildNarratorPrompt(
  worldSetting: WorldSetting,
  characters: Character[],
  currentScene: StoryScene | null
): string {
  return `# 上帝之手（旁白）

你是一个故事的叙述者，负责：
1. 描述场景和环境
2. 推进故事发展
3. 引入新的事件和冲突
4. 协调角色之间的互动

## 世界背景
世界：${worldSetting.worldName}（${worldSetting.worldType}）
时代：${worldSetting.timePeriod}
主要冲突：${worldSetting.mainConflict}
主题：${worldSetting.themes.join('、')}

## 当前场景
${currentScene ? `地点：${currentScene.location}
氛围：${currentScene.atmosphere}` : '故事开始'}

## 在场角色
${characters.map(c => `- ${c.name}：${c.background}`).join('\n')}

---
请以第三人称叙述的方式推进故事。描述要生动、有画面感。
回复时不要添加任何前缀，直接开始叙述。`;
}

export function buildDirectorPrompt(
  worldSetting: WorldSetting,
  characters: Character[],
  recentMessages: Array<{ speaker: string; content: string }>
): string {
  return `# 导演决策

你是故事的导演，负责决定下一个发言的角色。

## 世界背景
${worldSetting.worldName} - ${worldSetting.worldType}

## 可选角色
${characters.map(c => `- ${c.name}（${c.role}）：${c.personality.slice(0, 2).join('、')}`).join('\n')}

## 最近对话
${recentMessages.map(m => `${m.speaker}: ${m.content}`).join('\n')}

---
请分析当前情况，决定：
1. 是否需要旁白推进故事
2. 哪个角色应该发言
3. 是否需要用户回应

请以JSON格式返回决策：
{
  "nextAction": "character_turn | narrator_turn | user_turn",
  "selectedCharacterId": "角色ID（如果是character_turn）",
  "reason": "决策理由"
}`;
}

export async function generateCharacterResponse(
  character: Character,
  worldSetting: WorldSetting,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string
): Promise<string> {
  const systemPrompt = buildCharacterPrompt(
    character.agentConfig.soulFile,
    worldSetting,
    null,
    null
  );

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: userMessage }
  ];

  try {
    const response = await llmService.chat(messages, {
      maxTokens: 500,
      temperature: 0.8
    });
    return response;
  } catch (error) {
    console.error('Failed to generate character response:', error);
    return `${character.name}思考了一会儿...`;
  }
}

export async function generateNarratorResponse(
  worldSetting: WorldSetting,
  characters: Character[],
  context: string
): Promise<string> {
  const systemPrompt = buildNarratorPrompt(worldSetting, characters, null);

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: `请继续推进故事：\n${context}` }
  ];

  try {
    const response = await llmService.chat(messages, {
      maxTokens: 300,
      temperature: 0.7
    });
    return response;
  } catch (error) {
    console.error('Failed to generate narrator response:', error);
    return '故事继续...';
  }
}
