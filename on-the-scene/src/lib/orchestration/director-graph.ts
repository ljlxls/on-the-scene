import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { WorldSetting } from '../types/novel';
import { Character, MemoryFile } from '../types/character';
import { StoryScene, ChatMessage } from '../types/story';

export const StoryState = Annotation.Root({
  messages: Annotation<ChatMessage[]>,
  worldSetting: Annotation<WorldSetting>,
  characters: Annotation<Character[]>,
  currentScene: Annotation<StoryScene | null>,
  userCharacterId: Annotation<string>,
  
  currentAgentId: Annotation<string | null>,
  turnCount: Annotation<number>,
  shouldEnd: Annotation<boolean>,
  
  agentResponses: Annotation<AgentResponse[]>,
  memoryFiles: Annotation<Record<string, MemoryFile>>,
  
  lastUserMessage: Annotation<string>,
});

export interface AgentResponse {
  agentId: string;
  agentName: string;
  content: string;
  actions: string[];
  type: 'character' | 'narrator' | 'event';
}

export interface DirectorDecision {
  nextAction: 'user_turn' | 'character_turn' | 'narrator_turn' | 'end';
  selectedCharacterId?: string;
  reason: string;
}

const MAX_TURNS = 50;

export function createDirectorGraph() {
  return new StateGraph(StoryState)
    .addNode('director', directorNode)
    .addNode('character_agent', characterAgentNode)
    .addNode('narrator', narratorNode)
    .addEdge(START, 'director')
    .addConditionalEdges('director', routeAfterDirector)
    .addEdge('character_agent', 'director')
    .addEdge('narrator', 'director')
    .compile();
}

function routeAfterDirector(state: typeof StoryState.State): string {
  if (state.shouldEnd) {
    return END;
  }
  
  if (state.currentAgentId === 'user') {
    return END;
  }
  
  if (state.currentAgentId === 'narrator') {
    return 'narrator';
  }
  
  return 'character_agent';
}

async function directorNode(state: typeof StoryState.State): Promise<Partial<typeof StoryState.State>> {
  if (state.turnCount >= MAX_TURNS) {
    return { shouldEnd: true };
  }
  
  const decision = await makeDirectorDecision(state);
  
  switch (decision.nextAction) {
    case 'end':
      return { shouldEnd: true };
      
    case 'user_turn':
      return {
        currentAgentId: 'user',
        shouldEnd: true
      };
      
    case 'narrator_turn':
      return {
        currentAgentId: 'narrator',
        shouldEnd: false
      };
      
    case 'character_turn':
      return {
        currentAgentId: decision.selectedCharacterId || null,
        shouldEnd: false
      };
      
    default:
      return { currentAgentId: 'user', shouldEnd: true };
  }
}

async function makeDirectorDecision(state: typeof StoryState.State): Promise<DirectorDecision> {
  const recentMessages = state.messages.slice(-5);
  const lastMessage = recentMessages[recentMessages.length - 1];
  
  if (!lastMessage || lastMessage.type === 'user') {
    const otherCharacters = state.characters.filter(c => c.id !== state.userCharacterId);
    
    if (otherCharacters.length === 0) {
      return { nextAction: 'user_turn', reason: 'No other characters available' };
    }
    
    const randomIndex = Math.floor(Math.random() * otherCharacters.length);
    const selectedCharacter = otherCharacters[randomIndex];
    
    return {
      nextAction: 'character_turn',
      selectedCharacterId: selectedCharacter.id,
      reason: `Selected ${selectedCharacter.name} to respond`
    };
  }
  
  if (state.turnCount % 5 === 0) {
    return {
      nextAction: 'narrator_turn',
      reason: 'Time for narrator to advance the story'
    };
  }
  
  return { nextAction: 'user_turn', reason: 'User turn to respond' };
}

async function characterAgentNode(state: typeof StoryState.State): Promise<Partial<typeof StoryState.State>> {
  const agentId = state.currentAgentId;
  if (!agentId) {
    return { shouldEnd: true };
  }
  
  const character = state.characters.find(c => c.id === agentId);
  if (!character) {
    return { shouldEnd: true };
  }
  
  const response: AgentResponse = {
    agentId,
    agentName: character.name,
    content: '',
    actions: [],
    type: 'character'
  };
  
  return {
    turnCount: state.turnCount + 1,
    agentResponses: [...state.agentResponses, response]
  };
}

async function narratorNode(state: typeof StoryState.State): Promise<Partial<typeof StoryState.State>> {
  const response: AgentResponse = {
    agentId: 'narrator',
    agentName: '旁白',
    content: '',
    actions: [],
    type: 'narrator'
  };
  
  return {
    turnCount: state.turnCount + 1,
    agentResponses: [...state.agentResponses, response]
  };
}

export function buildInitialState(
  worldSetting: WorldSetting,
  characters: Character[],
  userCharacterId: string,
  initialMessage?: string
): typeof StoryState.State {
  return {
    messages: [],
    worldSetting,
    characters,
    currentScene: null,
    userCharacterId,
    currentAgentId: null,
    turnCount: 0,
    shouldEnd: false,
    agentResponses: [],
    memoryFiles: {},
    lastUserMessage: initialMessage || ''
  };
}
