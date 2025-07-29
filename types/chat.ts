export interface Personality {
  id: string;
  name: string;
  avatar: string;
  description: string;
  systemPrompt: string;
  createdAt: number;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  personalityId: string;
}

export interface Chat {
  personalityId: string;
  messages: Message[];
  lastUpdated: number;
}