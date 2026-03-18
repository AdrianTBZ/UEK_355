import { StyleSheet, Text, View } from "react-native";
import Voci from "../models/voci";

type Props = {
  voci: Voci;
};

export default function VociItem({ voci }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.term}>{voci.term}</Text>
      <Text style={styles.translation}>{voci.translation}</Text>
    </View>
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
