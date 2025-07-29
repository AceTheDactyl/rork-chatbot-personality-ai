import React from "react";
import { StyleSheet, View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { PersonalityForm } from "@/components/PersonalityForm";
import { useChatStore, usePersonality } from "@/hooks/useChatStore";

export default function EditPersonalityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const personality = usePersonality(id);
  const { updatePersonality, deletePersonality } = useChatStore();

  if (!personality) {
    router.back();
    return null;
  }

  const handleUpdate = (values: any) => {
    updatePersonality({
      ...personality,
      ...values,
    });
    router.back();
  };

  // Function to handle personality deletion
  const handleDeletePersonality = () => {
    Alert.alert(
      "Delete Personality",
      "Are you sure you want to delete this personality? This will also delete all chat history.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deletePersonality(personality.id);
            router.replace("/");
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <PersonalityForm
        initialValues={personality}
        onSubmit={handleUpdate}
        onCancel={() => router.back()}
        onDelete={handleDeletePersonality}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});