import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../constants/colors';
import { Message } from '@/types/chat';

interface ChatBubbleProps {
  message: Message;
  avatar?: string;
  isLastInGroup?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  avatar,
  isLastInGroup = false,
}) => {
  const isUser = message.role === 'user';
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.aiContainer,
    ]}>
      {!isUser && isLastInGroup && avatar && (
        <Image 
          source={{ uri: avatar }} 
          style={styles.avatar} 
          testID="ai-avatar"
        />
      )}
      {!isUser && isLastInGroup && !avatar && (
        <View style={styles.avatarPlaceholder} />
      )}
      {!isUser && !isLastInGroup && (
        <View style={styles.avatarPlaceholder} />
      )}
      
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.aiBubble,
      ]}>
        <Text style={styles.text}>{message.content}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    fontSize: 16,
    color: COLORS.text,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    marginRight: 8,
  },
});