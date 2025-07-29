import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Personality } from '@/types/chat';
import { MessageCircle } from 'lucide-react-native';

interface PersonalityCardProps {
  personality: Personality;
  onPress: () => void;
  hasMessages?: boolean;
}

export const PersonalityCard: React.FC<PersonalityCardProps> = ({ 
  personality, 
  onPress,
  hasMessages = false,
}) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      testID={`personality-card-${personality.id}`}
    >
      <Image 
        source={{ uri: personality.avatar }} 
        style={styles.avatar}
        testID="personality-avatar"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{personality.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {personality.description}
        </Text>
      </View>
      {hasMessages && (
        <View style={styles.messageIndicator}>
          <MessageCircle size={16} color={COLORS.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = width > 500 ? 500 : width - 32;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: cardWidth,
    alignSelf: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  messageIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
  },
});