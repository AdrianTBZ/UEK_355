import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import Voci from "../models/voci";

interface VociDetailProps {
  voci?: Voci;
  onSave: (voci: Voci) => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export default function VociDetail({ voci, onSave, onCancel, onDelete }: VociDetailProps) {
  const [term, setTerm] = useState(voci?.term ?? "");
  const [translation, setTranslation] = useState(voci?.translation ?? "");

  const isEditMode = voci !== undefined;

  function handleSave() {
    if (!term.trim() || !translation.trim()) {
      Alert.alert("Fehler", "Bitte füllen Sie beide Felder aus.");
      return;
    }

    onSave({ term: term.trim(), translation: translation.trim() });
  }

  function handleDelete() {
    Alert.alert(
      "Vokabel löschen",
      `Möchten Sie "${voci?.term}" wirklich löschen?`,
      [
        { text: "Abbrechen", style: "cancel" },
        { text: "Löschen", style: "destructive", onPress: onDelete },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Begriff"
        value={term}
        onChangeText={setTerm}
      />
      <TextInput
        style={styles.input}
        placeholder="Übersetzung"
        value={translation}
        onChangeText={setTranslation}
      />
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleSave}
      >
        <Text style={styles.buttonText}>Speichern</Text>
      </Pressable>
      {isEditMode && (
        <>
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonCancel, pressed && styles.buttonPressed]}
            onPress={onCancel}
          >
            <Text style={styles.buttonText}>Abbrechen</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonDelete, pressed && styles.buttonPressed]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Löschen</Text>
          </Pressable>
        </>
      )}
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
    marginBottom: 10,
  },
  buttonCancel: {
    backgroundColor: "#888888",
  },
  buttonDelete: {
    backgroundColor: "#cc3333",
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