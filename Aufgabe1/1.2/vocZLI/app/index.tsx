import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Voci from "../models/voci";
import VociItem from "../components/VociItem";

const vociList: Voci[] = [
  { term: "apple", translation: "Apfel" },
  { term: "car", translation: "Auto" },
  { term: "house", translation: "Haus" },
  { term: "dog", translation: "Hund" },
  { term: "book", translation: "Buch" },
  { term: "water", translation: "Wasser" },
  { term: "table", translation: "Tisch" },
  { term: "chair", translation: "Stuhl" },
  { term: "window", translation: "Fenster" },
  { term: "school", translation: "Schule" },
];

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
      />
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
});
