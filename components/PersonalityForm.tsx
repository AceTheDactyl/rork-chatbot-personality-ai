import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Personality } from '@/types/chat';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon } from 'lucide-react-native';

interface PersonalityFormProps {
  initialValues?: Partial<Personality>;
  onSubmit: (values: Omit<Personality, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const PersonalityForm: React.FC<PersonalityFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  onDelete,
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [avatar, setAvatar] = useState(initialValues?.avatar || 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?q=80&w=200&h=200&auto=format&fit=crop');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(initialValues?.systemPrompt || '');

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Description is required');
      return;
    }

    if (!systemPrompt.trim()) {
      Alert.alert('Error', 'System prompt is required');
      return;
    }

    onSubmit({
      name: name.trim(),
      avatar,
      description: description.trim(),
      systemPrompt: systemPrompt.trim(),
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {initialValues?.id ? 'Edit Personality' : 'Create New Personality'}
      </Text>

      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <ImageIcon size={40} color={COLORS.textSecondary} />
          </View>
        )}
        <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
          <Camera size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter personality name"
        placeholderTextColor={COLORS.textSecondary}
        maxLength={50}
        testID="name-input"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe this personality"
        placeholderTextColor={COLORS.textSecondary}
        multiline
        maxLength={200}
        testID="description-input"
      />

      <Text style={styles.label}>System Prompt</Text>
      <Text style={styles.helpText}>
        This defines how the AI will behave and respond.
      </Text>
      <TextInput
        style={[styles.input, styles.textArea, styles.promptInput]}
        value={systemPrompt}
        onChangeText={setSystemPrompt}
        placeholder="You are a helpful assistant..."
        placeholderTextColor={COLORS.textSecondary}
        multiline
        maxLength={1000}
        testID="prompt-input"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.submitButton]} 
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {initialValues?.id ? 'Update' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {initialValues?.id && initialValues.id.startsWith('custom-') && onDelete && (
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={onDelete}
          testID="delete-button"
        >
          <Text style={styles.deleteButtonText}>Delete Personality</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  promptInput: {
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});