import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useVoci } from "../context/vociContext";

export default function LearnScreen() {
  const router = useRouter();
  const { vociList } = useVoci();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const currentVoci = vociList[currentIndex];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showTranslation) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [showTranslation]);

  function handleNext(wasCorrect: boolean) {
    if (wasCorrect) {
      setCorrect((c) => c + 1);
    } else {
      setWrong((w) => w + 1);
    }

    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -400,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      slideAnim.setValue(400);
      if (currentIndex < vociList.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowTranslation(false);
      } else {
        router.back();
      }
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {currentIndex + 1} / {vociList.length}
      </Text>

      <Text style={styles.stats}>
        Richtig: {correct} | Falsch: {wrong}
      </Text>

      <Animated.View
        style={[styles.card, { transform: [{ translateX: slideAnim }] }]}
      >
        <Text style={styles.term}>{currentVoci.term}</Text>
        {showTranslation && (
          <Animated.Text style={[styles.translation, { opacity: fadeAnim }]}>
            {currentVoci.translation}
          </Animated.Text>
        )}
      </Animated.View>

      {!showTranslation && (
        <Pressable
          style={styles.btnShow}
          onPress={() => setShowTranslation(true)}
        >
          <Text style={styles.btnText}>Übersetzung zeigen</Text>
        </Pressable>
      )}

      {showTranslation && (
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.btnWrong}
            onPress={() => handleNext(false)}
          >
            <Text style={styles.btnText}>Nicht gewusst</Text>
          </Pressable>
          <Pressable
            style={styles.btnCorrect}
            onPress={() => handleNext(true)}
          >
            <Text style={styles.btnText}>Gewusst</Text>
          </Pressable>
        </View>
      )}
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
    marginBottom: 8,
  },
  stats: {
    fontSize: 14,
    color: "#444444",
    marginBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 48,
    alignItems: "center",
    elevation: 6,
    marginBottom: 32,
  },
  term: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
  translation: {
    fontSize: 28,
    color: "#555555",
    marginTop: 16,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
  },
  btnShow: {
    backgroundColor: "#1a7a4a",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  btnCorrect: {
    backgroundColor: "#1a7a4a",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  btnWrong: {
    backgroundColor: "#c0392b",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  btnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
