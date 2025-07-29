import React, { useCallback } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useChatStore } from "@/hooks/useChatStore";
import { PersonalityCard } from "@/components/PersonalityCard";
import { COLORS } from "../../constants/colors";
import { useQueryClient } from "@tanstack/react-query";

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { personalities, chats, isLoading } = useChatStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen is focused
      queryClient.invalidateQueries({ queryKey: ['personalities'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }, [queryClient])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['personalities'] });
    queryClient.invalidateQueries({ queryKey: ['chats'] });
    setTimeout(() => setRefreshing(false), 1000);
  }, [queryClient]);

  const navigateToChat = (id: string) => {
    router.push(`/chat/${id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={personalities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PersonalityCard
            personality={item}
            onPress={() => navigateToChat(item.id)}
            hasMessages={Boolean(chats[item.id]?.messages.length)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.header}>Choose a personality to chat with</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No personalities available</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});