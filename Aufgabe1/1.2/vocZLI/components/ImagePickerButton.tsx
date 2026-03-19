import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

async function copyImageToAppDirectory(uri: string): Promise<string> {
  const compressed = await manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.7, format: SaveFormat.JPEG }
  );
  const fileName = `${Date.now()}.jpg`;
  const destUri = FileSystem.documentDirectory + fileName;
  await FileSystem.copyAsync({ from: compressed.uri, to: destUri });
  return destUri;
}

interface ImagePickerButtonProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
}

export default function ImagePickerButton({ imageUri, onImageSelected }: ImagePickerButtonProps) {
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Fehler', 'Kamera-Zugriff benötigt!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      try {
        const permanentUri = await copyImageToAppDirectory(result.assets[0].uri);
        onImageSelected(permanentUri);
      } catch {
        Alert.alert('Fehler', 'Bild konnte nicht gespeichert werden.');
      }
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Fehler', 'Zugriff auf Galerie benötigt!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      try {
        const permanentUri = await copyImageToAppDirectory(result.assets[0].uri);
        onImageSelected(permanentUri);
      } catch {
        Alert.alert('Fehler', 'Bild konnte nicht gespeichert werden.');
      }
    }
  };

  const handlePress = () => {
    Alert.alert('Bild auswählen', undefined, [
      { text: 'Foto aufnehmen', onPress: openCamera },
      { text: 'Aus Galerie wählen', onPress: openGallery },
      { text: 'Abbrechen', style: 'cancel' },
    ]);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <Text style={styles.placeholder}>Bild hinzufügen</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
