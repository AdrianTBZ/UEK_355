import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import Voci from "../models/voci";

interface VociDetailProps {
  onSave: (voci: Voci) => void;
}

export default function VociDetail({ onSave }: VociDetailProps) {
  const [term, setTerm] = useState("");
  const [translation, setTranslation] = useState("");

  function handleSave() {
    if (!term.trim() || !translation.trim()) {
      Alert.alert("Fehler", "Bitte füllen Sie beide Felder aus.");
      return;
    }

    const voci: Voci = { term: term.trim(), translation: translation.trim() };
    onSave(voci);
    setTerm("");
    setTranslation("");
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Begriff (Term)"
        value={term}
        onChangeText={setTerm}
      />
      <TextInput
        style={styles.input}
        placeholder="Übersetzung (Translation)"
        value={translation}
        onChangeText={setTranslation}
      />
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleSave}
      >
        <Text style={styles.buttonText}>Speichern</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  button: {
    backgroundColor: "#1a7a4a",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});