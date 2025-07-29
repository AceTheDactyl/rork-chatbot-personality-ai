import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Chat, Message, Personality } from '@/types/chat';
import { DEFAULT_PERSONALITIES } from '@/constants/defaultPersonalities';

const STORAGE_KEYS = {
  PERSONALITIES: 'ai-chat-personalities',
  CHATS: 'ai-chat-messages',
};

export const [ChatStoreProvider, useChatStore] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch personalities from storage
  const personalitiesQuery = useQuery({
    queryKey: ['personalities'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.PERSONALITIES);
        if (!stored) {
          // Initialize with default personalities if none exist
          await AsyncStorage.setItem(
            STORAGE_KEYS.PERSONALITIES,
            JSON.stringify(DEFAULT_PERSONALITIES)
          );
          return DEFAULT_PERSONALITIES;
        }
        return JSON.parse(stored) as Personality[];
      } catch (error) {
        console.error('Error loading personalities:', error);
        return DEFAULT_PERSONALITIES;
      }
    },
  });

  // Fetch chats from storage
  const chatsQuery = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
        if (!stored) {
          return {} as Record<string, Chat>;
        }
        return JSON.parse(stored) as Record<string, Chat>;
      } catch (error) {
        console.error('Error loading chats:', error);
        return {} as Record<string, Chat>;
      }
    },
  });

  // Save personalities mutation
  const savePersonalitiesMutation = useMutation({
    mutationFn: async (personalities: Personality[]) => {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PERSONALITIES,
        JSON.stringify(personalities)
      );
      return personalities;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['personalities'], data);
    },
  });

  // Save chats mutation
  const saveChatsMutation = useMutation({
    mutationFn: async (chats: Record<string, Chat>) => {
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      return chats;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['chats'], data);
    },
  });

  // Initialize data
  useEffect(() => {
    if (personalitiesQuery.data && chatsQuery.data && !isInitialized) {
      setIsInitialized(true);
    }
  }, [personalitiesQuery.data, chatsQuery.data, isInitialized]);

  // Add a new personality
  const addPersonality = (personality: Omit<Personality, 'id' | 'createdAt'>) => {
    if (!personalitiesQuery.data) return;
    
    const newPersonality: Personality = {
      ...personality,
      id: `custom-${Date.now()}`,
      createdAt: Date.now(),
    };
    
    const updatedPersonalities = [...personalitiesQuery.data, newPersonality];
    savePersonalitiesMutation.mutate(updatedPersonalities);
    return newPersonality;
  };

  // Update an existing personality
  const updatePersonality = (personality: Personality) => {
    if (!personalitiesQuery.data) return;
    
    const updatedPersonalities = personalitiesQuery.data.map(p => 
      p.id === personality.id ? personality : p
    );
    
    savePersonalitiesMutation.mutate(updatedPersonalities);
  };

  // Delete a personality
  const deletePersonality = (personalityId: string) => {
    if (!personalitiesQuery.data || !chatsQuery.data) return;
    
    // Don't allow deleting default personalities
    if (DEFAULT_PERSONALITIES.some(p => p.id === personalityId)) {
      return;
    }
    
    const updatedPersonalities = personalitiesQuery.data.filter(
      p => p.id !== personalityId
    );
    
    // Also delete associated chat
    const updatedChats = { ...chatsQuery.data };
    delete updatedChats[personalityId];
    
    savePersonalitiesMutation.mutate(updatedPersonalities);
    saveChatsMutation.mutate(updatedChats);
  };

  // Add a message to a chat
  const addMessage = (personalityId: string, message: Omit<Message, 'id' | 'timestamp' | 'personalityId'>) => {
    if (!chatsQuery.data) return;
    
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      personalityId,
    };
    
    const existingChat = chatsQuery.data[personalityId] || {
      personalityId,
      messages: [],
      lastUpdated: Date.now(),
    };
    
    const updatedChat: Chat = {
      ...existingChat,
      messages: [...existingChat.messages, newMessage],
      lastUpdated: Date.now(),
    };
    
    const updatedChats = {
      ...chatsQuery.data,
      [personalityId]: updatedChat,
    };
    
    saveChatsMutation.mutate(updatedChats);
    return newMessage;
  };

  // Clear chat history for a personality
  const clearChat = (personalityId: string) => {
    if (!chatsQuery.data) return;
    
    const updatedChats = { ...chatsQuery.data };
    
    if (updatedChats[personalityId]) {
      updatedChats[personalityId] = {
        personalityId,
        messages: [],
        lastUpdated: Date.now(),
      };
      
      saveChatsMutation.mutate(updatedChats);
    }
  };

  return {
    personalities: personalitiesQuery.data || [],
    chats: chatsQuery.data || {},
    isLoading: personalitiesQuery.isLoading || chatsQuery.isLoading,
    isInitialized,
    addPersonality,
    updatePersonality,
    deletePersonality,
    addMessage,
    clearChat,
  };
});

// Helper hook to get a specific chat
export const useChat = (personalityId: string) => {
  const { chats, addMessage, clearChat } = useChatStore();
  
  const chat = chats[personalityId] || {
    personalityId,
    messages: [],
    lastUpdated: 0,
  };
  
  return {
    chat,
    messages: chat.messages,
    addMessage: (content: string, role: 'user' | 'assistant') => 
      addMessage(personalityId, { content, role }),
    clearChat: () => clearChat(personalityId),
  };
};

// Helper hook to get a specific personality
export const usePersonality = (personalityId: string) => {
  const { personalities } = useChatStore();
  return personalities.find(p => p.id === personalityId);
};