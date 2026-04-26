import { nanoid } from 'nanoid';
import { llmService } from './llm-service';
import { WorldSetting, KeyLocation, KeyEvent } from '../types/novel';

export class WorldBuilderService {
  async buildWorld(novelContent: string, novelId: string): Promise<WorldSetting> {
    const prompt = this.buildPrompt(novelContent);
    
    const response = await llmService.chat([
      { role: 'system', content: '你是一个专业的小说分析师，擅长提取世界观信息。请以JSON格式返回结果。' },
      { role: 'user', content: prompt }
    ]);
    
    const parsed = this.parseResponse(response);
    
    return {
      id: nanoid(),
      novelId,
      ...parsed,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  private buildPrompt(content: string): string {
    const truncatedContent = content.substring(0, 15000);
    
    return `
请分析以下小说内容，提取世界观信息。

小说内容：
${truncatedContent}

请以JSON格式返回以下信息（不要添加任何其他文字，只返回JSON）：
{
  "worldName": "世界名称",
  "worldType": "世界类型（奇幻/科幻/现代/古代等）",
  "timePeriod": "时间背景",
  "geography": "地理环境描述",
  "socialStructure": "社会结构",
  "rules": ["世界规则1", "世界规则2"],
  "mainConflict": "主要冲突",
  "themes": ["主题1", "主题2"],
  "tone": "基调（轻松/严肃/黑暗等）",
  "keyLocations": [
    { "name": "地点名称", "description": "描述" }
  ],
  "keyEvents": [
    { "name": "事件名称", "description": "描述" }
  ]
}
`;
  }
  
  private parseResponse(response: string): Omit<WorldSetting, 'id' | 'novelId' | 'createdAt' | 'updatedAt'> {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        worldName: parsed.worldName || '未知世界',
        worldType: parsed.worldType || '未知',
        timePeriod: parsed.timePeriod || '未知',
        geography: parsed.geography || '',
        socialStructure: parsed.socialStructure || '',
        rules: parsed.rules || [],
        mainConflict: parsed.mainConflict || '',
        themes: parsed.themes || [],
        tone: parsed.tone || '中性',
        keyLocations: parsed.keyLocations || [],
        keyEvents: parsed.keyEvents || []
      };
    } catch (error) {
      console.error('Failed to parse world setting:', error);
      return {
        worldName: '未知世界',
        worldType: '未知',
        timePeriod: '未知',
        geography: '',
        socialStructure: '',
        rules: [],
        mainConflict: '',
        themes: [],
        tone: '中性',
        keyLocations: [],
        keyEvents: []
      };
    }
  }
}

export const worldBuilderService = new WorldBuilderService();
