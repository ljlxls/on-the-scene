import { nanoid } from 'nanoid';
import { llmService } from './llm-service';
import { Character, SoulFile, AgentConfig } from '../types/character';
import { WorldSetting } from '../types/novel';

const CHARACTER_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336',
  '#00BCD4', '#FF5722', '#607D8B', '#795548', '#3F51B5'
];

const CHARACTER_AVATARS = ['👨', '👩', '🧑', '👴', '👵', '🧔', '👱', '👸', '🤴', '🧙'];

export class CharacterGeneratorService {
  async generateCharacters(
    novelContent: string,
    worldSetting: WorldSetting,
    novelId: string
  ): Promise<Character[]> {
    const prompt = this.buildPrompt(novelContent, worldSetting);
    
    const response = await llmService.chat([
      { role: 'system', content: '你是一个专业的小说分析师，擅长提取角色信息。请以JSON格式返回结果。' },
      { role: 'user', content: prompt }
    ]);
    
    const characters = this.parseResponse(response);
    
    const fullCharacters: Character[] = [];
    
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const soulFile = await this.generateSoulFile(char, worldSetting);
      
      const fullCharacter: Character = {
        id: nanoid(),
        novelId,
        name: char.name,
        aliases: char.aliases || [],
        role: char.role || 'supporting',
        importance: char.importance || 5,
        appearance: {
          description: char.appearance?.description || '',
          avatar: CHARACTER_AVATARS[i % CHARACTER_AVATARS.length],
          color: CHARACTER_COLORS[i % CHARACTER_COLORS.length]
        },
        personality: char.personality || [],
        background: char.background || '',
        motivations: char.motivations || [],
        fears: char.fears || [],
        values: char.values || [],
        abilities: char.abilities || [],
        weaknesses: char.weaknesses || [],
        relationships: char.relationships || [],
        agentConfig: {
          id: nanoid(),
          name: char.name,
          role: char.role || 'supporting',
          persona: this.buildPersona(char, soulFile),
          avatar: CHARACTER_AVATARS[i % CHARACTER_AVATARS.length],
          color: CHARACTER_COLORS[i % CHARACTER_COLORS.length],
          allowedActions: ['speak', 'act', 'think'],
          priority: char.importance || 5,
          soulFile,
          isUserControlled: false,
          isGenerated: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      fullCharacters.push(fullCharacter);
    }
    
    return fullCharacters;
  }
  
  private buildPrompt(content: string, worldSetting: WorldSetting): string {
    const truncatedContent = content.substring(0, 15000);
    
    return `
请分析以下小说内容，提取主要角色信息。

世界观：${worldSetting.worldName} - ${worldSetting.worldType}

小说内容：
${truncatedContent}

请以JSON格式返回3-5个主要角色的信息（不要添加任何其他文字，只返回JSON数组）：
[
  {
    "name": "角色名",
    "aliases": ["别名1", "别名2"],
    "role": "protagonist/antagonist/supporting/minor",
    "importance": 1-10的数字,
    "appearance": {
      "description": "外貌描述"
    },
    "personality": ["性格特点1", "性格特点2"],
    "background": "背景故事",
    "motivations": ["动机1", "动机2"],
    "fears": ["恐惧1"],
    "values": ["价值观1"],
    "abilities": ["能力1"],
    "weaknesses": ["弱点1"],
    "relationships": [
      { "targetId": "其他角色名", "type": "关系类型", "description": "关系描述" }
    ]
  }
]
`;
  }
  
  private parseResponse(response: string): Partial<Character>[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse characters:', error);
      return [];
    }
  }
  
  private async generateSoulFile(
    character: Partial<Character>,
    worldSetting: WorldSetting
  ): Promise<SoulFile> {
    const prompt = `
你是一个角色设计师。请为以下角色生成详细的灵魂文件。

角色信息：
- 名字：${character.name}
- 角色：${character.role}
- 背景：${character.background}
- 性格：${character.personality?.join('、')}
- 动机：${character.motivations?.join('、')}
- 恐惧：${character.fears?.join('、')}

世界观：${worldSetting.worldName} - ${worldSetting.worldType}

请以JSON格式返回灵魂文件（不要添加任何其他文字，只返回JSON）：
{
  "identity": {
    "name": "角色名",
    "role": "角色定位",
    "coreTraits": ["核心特质1", "核心特质2", "核心特质3"]
  },
  "personality": {
    "traits": ["性格特点1", "性格特点2"],
    "speechStyle": "说话风格描述",
    "decisionStyle": "决策风格描述"
  },
  "backstory": {
    "origin": "出身背景",
    "keyEvents": ["关键经历1", "关键经历2"],
    "secrets": ["秘密1"]
  },
  "motivations": {
    "goals": ["目标1", "目标2"],
    "desires": ["欲望1"],
    "fears": ["恐惧1"]
  },
  "behaviorRules": {
    "alwaysDo": ["总是会做的事1"],
    "neverDo": ["绝对不会做的事1"],
    "triggers": [
      { "condition": "触发条件", "reaction": "反应" }
    ]
  }
}
`;

    const response = await llmService.chat([
      { role: 'system', content: '你是一个角色设计师，擅长创建角色的灵魂文件。请以JSON格式返回结果。' },
      { role: 'user', content: prompt }
    ]);
    
    return this.parseSoulFile(response, character.name || 'Unknown');
  }
  
  private parseSoulFile(response: string, characterName: string): SoulFile {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        characterId: '',
        identity: parsed.identity || {
          name: characterName,
          role: '未知',
          coreTraits: []
        },
        personality: parsed.personality || {
          traits: [],
          speechStyle: '',
          decisionStyle: ''
        },
        backstory: parsed.backstory || {
          origin: '',
          keyEvents: [],
          secrets: []
        },
        motivations: parsed.motivations || {
          goals: [],
          desires: [],
          fears: []
        },
        relationships: {},
        behaviorRules: parsed.behaviorRules || {
          alwaysDo: [],
          neverDo: [],
          triggers: []
        }
      };
    } catch (error) {
      console.error('Failed to parse soul file:', error);
      return {
        characterId: '',
        identity: {
          name: characterName,
          role: '未知',
          coreTraits: []
        },
        personality: {
          traits: [],
          speechStyle: '',
          decisionStyle: ''
        },
        backstory: {
          origin: '',
          keyEvents: [],
          secrets: []
        },
        motivations: {
          goals: [],
          desires: [],
          fears: []
        },
        relationships: {},
        behaviorRules: {
          alwaysDo: [],
          neverDo: [],
          triggers: []
        }
      };
    }
  }
  
  private buildPersona(character: Partial<Character>, soulFile: SoulFile): string {
    return `你是${character.name}，${soulFile.identity.role}。

核心特质：${soulFile.identity.coreTraits.join('、')}
性格特点：${soulFile.personality.traits.join('、')}
说话风格：${soulFile.personality.speechStyle}

背景故事：${soulFile.backstory.origin}
${soulFile.backstory.keyEvents.map(e => `- ${e}`).join('\n')}

动机：
- 目标：${soulFile.motivations.goals.join('、')}
- 欲望：${soulFile.motivations.desires.join('、')}
- 恐惧：${soulFile.motivations.fears.join('、')}

行为准则：
- 总是做：${soulFile.behaviorRules.alwaysDo.join('、')}
- 绝不做：${soulFile.behaviorRules.neverDo.join('、')}

请保持角色一致性，展现你的性格特点和说话风格。`;
  }
}

export const characterGeneratorService = new CharacterGeneratorService();
