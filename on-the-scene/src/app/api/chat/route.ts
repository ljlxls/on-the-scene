import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import { storageService } from '@/lib/storage/storage-service';
import { llmService } from '@/lib/services/llm-service';
import { ChatMessage } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    await storageService.init();
    
    const body = await request.json();
    const { storyId, message, characterId } = body;
    
    if (!storyId || !message) {
      return new Response(JSON.stringify({ error: 'Story ID and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const story = await storageService.getStory(storyId);
    if (!story) {
      return new Response(JSON.stringify({ error: 'Story not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const modelConfig = await storageService.getModelConfig('default');
    if (!modelConfig) {
      return new Response(JSON.stringify({ error: 'Model config not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    llmService.setConfig(modelConfig);
    
    const userMessage: ChatMessage = {
      id: nanoid(),
      storyId,
      characterId,
      content: message,
      type: 'user',
      createdAt: new Date()
    };
    
    await storageService.saveChatMessage(userMessage);
    
    const characters = await storageService.getCharactersByNovel(story.novelId);
    const userCharacter = characters.find(c => c.id === story.userCharacterId);
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'user_message', data: userMessage })}\n\n`));
          
          const otherCharacters = characters.filter(c => c.id !== story.userCharacterId);
          const respondingCharacter = otherCharacters[Math.floor(Math.random() * otherCharacters.length)];
          
          if (respondingCharacter) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'thinking', 
              data: { stage: 'agent_loading', agentId: respondingCharacter.id } 
            })}\n\n`));
            
            const systemPrompt = respondingCharacter.agentConfig.persona;
            const messages = await storageService.getChatMessagesByStory(storyId);
            
            const chatHistory = messages.slice(-10).map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.content
            }));
            
            chatHistory.push({ role: 'user', content: message });
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'agent_start', 
              data: { 
                agentId: respondingCharacter.id, 
                agentName: respondingCharacter.name,
                agentAvatar: respondingCharacter.appearance.avatar,
                agentColor: respondingCharacter.appearance.color
              } 
            })}\n\n`));
            
            let fullResponse = '';
            
            try {
              for await (const chunk of llmService.streamChat([
                { role: 'system', content: systemPrompt },
                ...chatHistory
              ])) {
                fullResponse += chunk;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'text_delta', 
                  data: { content: chunk } 
                })}\n\n`));
              }
            } catch {
              fullResponse = `${respondingCharacter.name}思考了一会儿...`;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'text_delta', 
                data: { content: fullResponse } 
              })}\n\n`));
            }
            
            const aiMessage: ChatMessage = {
              id: nanoid(),
              storyId,
              characterId: respondingCharacter.id,
              content: fullResponse,
              type: 'character',
              createdAt: new Date()
            };
            
            await storageService.saveChatMessage(aiMessage);
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'agent_end', 
              data: { agentId: respondingCharacter.id } 
            })}\n\n`));
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'cue_user', data: {} })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            data: { message: error instanceof Error ? error.message : 'Unknown error' } 
          })}\n\n`));
          controller.close();
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Failed to process chat:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
