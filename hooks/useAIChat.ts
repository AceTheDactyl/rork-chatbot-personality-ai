import { useState } from 'react';
import { useChat, usePersonality } from './useChatStore';
import { Message } from '@/types/chat';

export const useAIChat = (personalityId: string) => {
  const { chat, addMessage, clearChat } = useChat(personalityId);
  const personality = usePersonality(personalityId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    if (!personality) {
      setError('Personality not found');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to chat
      addMessage(content, 'user');
      
      // Prepare messages for AI API
      const messages = [
        { role: 'system', content: personality.systemPrompt },
        ...chat.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content },
      ];
      
      // Call AI API
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Add AI response to chat
      addMessage(data.completion, 'assistant');
      
    } catch (err) {
      console.error('Error in AI chat:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages: chat.messages,
    sendMessage,
    isLoading,
    error,
    clearChat,
  };
};