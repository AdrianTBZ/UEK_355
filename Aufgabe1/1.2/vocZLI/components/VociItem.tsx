import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
        {voci.imageUri && (
          <Image source={{ uri: voci.imageUri }} style={styles.thumbnail} />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.term}>{voci.term}</Text>
          <Text style={styles.translation}>{voci.translation}</Text>
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#dddddd",
  },
  textContainer: {
    flex: 1,
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
