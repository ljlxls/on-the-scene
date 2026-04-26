import { nanoid } from 'nanoid';
import { llmService } from './llm-service';
import { WorldSetting, StoryOutline } from '../types/novel';
import { Character } from '../types/character';
import { StoryScene, SceneType } from '../types/story';

export class StoryGeneratorService {
  async generateStoryOutline(
    novelContent: string,
    worldSetting: WorldSetting,
    characters: Character[]
  ): Promise<StoryOutline[]> {
    const prompt = this.buildOutlinePrompt(novelContent, worldSetting, characters);
    
    const response = await llmService.chat([
      { role: 'system', content: '你是一个专业的故事策划师，擅长设计故事大纲。请以JSON格式返回结果。' },
      { role: 'user', content: prompt }
    ]);
    
    return this.parseOutlineResponse(response, worldSetting.novelId);
  }

  private buildOutlinePrompt(
    content: string,
    worldSetting: WorldSetting,
    characters: Character[]
  ): string {
    const truncatedContent = content.substring(0, 10000);
    
    return `
请根据以下信息生成故事大纲。

## 世界背景
世界：${worldSetting.worldName}（${worldSetting.worldType}）
时代：${worldSetting.timePeriod}
主要冲突：${worldSetting.mainConflict}

## 主要角色
${characters.slice(0, 5).map(c => `- ${c.name}：${c.background}`).join('\n')}

## 小说内容参考
${truncatedContent}

请以JSON格式返回5-10个故事章节的大纲（不要添加任何其他文字，只返回JSON数组）：
[
  {
    "title": "章节标题",
    "description": "章节描述",
    "keyPoints": ["关键点1", "关键点2"],
    "order": 1
  }
]
`;
  }

  private parseOutlineResponse(response: string, novelId: string): StoryOutline[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return this.getDefaultOutline(novelId);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.map((item: any, index: number) => ({
        id: nanoid(),
        novelId,
        title: item.title || `第${index + 1}章`,
        description: item.description || '',
        order: item.order || index + 1,
        keyPoints: item.keyPoints || []
      }));
    } catch (error) {
      console.error('Failed to parse story outline:', error);
      return this.getDefaultOutline(novelId);
    }
  }

  private getDefaultOutline(novelId: string): StoryOutline[] {
    return [
      {
        id: nanoid(),
        novelId,
        title: '故事开始',
        description: '故事的序幕即将展开...',
        order: 1,
        keyPoints: ['故事开始']
      }
    ];
  }

  async generateScene(
    worldSetting: WorldSetting,
    characters: Character[],
    outline: StoryOutline,
    sceneType: SceneType = 'dialogue'
  ): Promise<StoryScene> {
    const prompt = this.buildScenePrompt(worldSetting, characters, outline, sceneType);
    
    const response = await llmService.chat([
      { role: 'system', content: '你是一个专业的场景设计师，擅长创造生动的故事场景。' },
      { role: 'user', content: prompt }
    ]);

    return this.parseSceneResponse(response, outline);
  }

  private buildScenePrompt(
    worldSetting: WorldSetting,
    characters: Character[],
    outline: StoryOutline,
    sceneType: SceneType
  ): string {
    return `
请为以下故事章节创建一个场景。

## 章节信息
标题：${outline.title}
描述：${outline.description}
关键点：${outline.keyPoints.join('、')}

## 世界背景
世界：${worldSetting.worldName}
主要冲突：${worldSetting.mainConflict}

## 可用角色
${characters.map(c => `- ${c.name}`).join('\n')}

## 场景类型
${sceneType}

请描述这个场景，包括：
1. 地点描述
2. 氛围
3. 在场的角色
4. 场景目标
`;
  }

  private parseSceneResponse(response: string, outline: StoryOutline): StoryScene {
    return {
      id: nanoid(),
      storyId: '',
      type: 'dialogue',
      title: outline.title,
      description: response,
      order: outline.order,
      location: '未知地点',
      presentCharacters: [],
      atmosphere: '神秘',
      objectives: [],
      events: [],
      createdAt: new Date()
    };
  }
}

export const storyGeneratorService = new StoryGeneratorService();
