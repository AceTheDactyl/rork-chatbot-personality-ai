import React, { useEffect, useRef, useState } from "react";
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useAIChat } from "@/hooks/useAIChat";
import { usePersonality } from "@/hooks/useChatStore";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatInput } from "@/components/ChatInput";
import { COLORS } from "@/constants/colors";
import { Edit, MoreVertical, Trash2 } from "lucide-react-native";
import { Message } from "@/types/chat";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const personality = usePersonality(id);
  const { messages, sendMessage, isLoading, error, clearChat } = useAIChat(id);
  const flatListRef = useRef<FlatList>(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleClearChat = () => {
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to clear all messages? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            clearChat();
            setShowOptions(false);
          }
        },
      ]
    );
  };

  const handleEditPersonality = () => {
    if (personality) {
      router.push(`/personality/edit/${personality.id}`);
      setShowOptions(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    // Check if this message is the last in a group of messages from the same role
    const isLastInGroup = 
      index === messages.length - 1 || 
      messages[index + 1]?.role !== item.role;
    
    return (
      <ChatBubble 
        message={item} 
        avatar={item.role === 'assistant' ? personality?.avatar : undefined}
        isLastInGroup={isLastInGroup}
      />
    );
  };

  if (!personality) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Personality not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: personality.name,
          headerRight: () => (
            <View style={styles.headerRight}>
              {showOptions ? (
                <View style={styles.optionsContainer}>
                  {personality.id.startsWith('custom-') && (
                    <TouchableOpacity 
                      style={styles.optionButton} 
                      onPress={handleEditPersonality}
                    >
                      <Edit size={20} color={COLORS.text} />
                      <Text style={styles.optionText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.optionButton} 
                    onPress={handleClearChat}
                  >
                    <Trash2 size={20} color={COLORS.error} />
                    <Text style={[styles.optionText, { color: COLORS.error }]}>
                      Clear Chat
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => setShowOptions(true)}
                  style={styles.moreButton}
                >
                  <MoreVertical size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptyText}>
              Say hello to {personality.name} and start chatting!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onTouchStart={() => setShowOptions(false)}
          />
        )}
        
        <ChatInput 
          onSend={sendMessage} 
          isLoading={isLoading}
          placeholder={`Message ${personality.name}...`}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  headerRight: {
    position: 'relative',
  },
  moreButton: {
    padding: 8,
  },
  optionsContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 150,
    zIndex: 1000,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
});