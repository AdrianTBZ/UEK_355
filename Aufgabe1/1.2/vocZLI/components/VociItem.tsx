import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import Voci from "../models/voci";

type Props = {
  voci: Voci;
};

export default function VociItem({ voci }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/editVoci?term=${encodeURIComponent(voci.term)}`)}
    >
      <View style={styles.card}>
        <Text style={styles.term}>{voci.term}</Text>
        <Text style={styles.translation}>{voci.translation}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 3,
  },
  term: {
    fontSize: 18,
    fontWeight: "bold",
  },
  translation: {
    fontSize: 14,
    fontWeight: "normal",
  },
});
