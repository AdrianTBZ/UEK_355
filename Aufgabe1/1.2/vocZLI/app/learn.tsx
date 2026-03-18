import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Voci from "../models/voci";

// TODO: Temporäre Duplikation – wird später durch React Context ersetzt
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

export default function LearnScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentVoci = vociList[currentIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {currentIndex + 1} / {vociList.length}
      </Text>

      <View style={styles.card}>
        <Text style={styles.term}>{currentVoci.term}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    paddingTop: 40,
    backgroundColor: "#f0f0f0",
  },
  progress: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 32,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 48,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  term: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
});
