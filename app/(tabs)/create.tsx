import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { PersonalityForm } from "@/components/PersonalityForm";
import { useChatStore } from "@/hooks/useChatStore";

export default function CreateScreen() {
  const router = useRouter();
  const { addPersonality } = useChatStore();

  const handleCreate = (values: any) => {
    const newPersonality = addPersonality(values);
    if (newPersonality) {
      router.push(`/chat/${newPersonality.id}`);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <PersonalityForm
        onSubmit={handleCreate}
        onCancel={() => router.back()}
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