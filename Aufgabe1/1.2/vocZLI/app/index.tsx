import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import VociItem from "../components/VociItem";
import { useVoci } from "../context/vociContext";

function EmptyList() {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={64} color="#cccccc" />
      <Text style={styles.emptyText}>Keine Vokabeln vorhanden</Text>
      <Text style={styles.emptySubText}>Fügen Sie Vokabeln hinzu, um zu starten.</Text>
    </View>
  );
}

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { vociList, isLoading } = useVoci();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a7a4a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>VocZLI</Text>
        <Text style={styles.subtitle}>Meine Vokabel-Lern-App</Text>
      </View>
      <FlatList
        data={vociList}
        keyExtractor={(item) => item.term}
        renderItem={({ item }) => <VociItem voci={item} />}
        ListEmptyComponent={EmptyList}
        contentContainerStyle={{ paddingBottom: insets.bottom}}
      />
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 20 },
          pressed && styles.fabPressed,
        ]}
        onPress={() => router.push("/learn")}
      >
        <Ionicons name="play" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999999",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#bbbbbb",
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1a7a4a",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.75,
    elevation: 4,
  },
});
