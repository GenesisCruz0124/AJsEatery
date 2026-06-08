import React from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { copyImageToAppStorage } from '../utils/imageHelpers';
import { COLORS } from '../constants/colors';

interface Props {
  uri: string | null;
  onImageSelected: (uri: string) => void;
}

export function ImagePickerButton({ uri, onImageSelected }: Props) {
  async function pick() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      const stored = await copyImageToAppStorage(result.assets[0].uri);
      onImageSelected(stored);
    }
  }

  return (
    <Pressable style={styles.container} onPress={pick}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="camera-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.hint}>Tap to add photo</Text>
        </View>
      )}
      {uri && (
        <View style={styles.editOverlay}>
          <Ionicons name="pencil" size={18} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  hint: { color: COLORS.textSecondary, fontSize: 13 },
  editOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    padding: 6,
  },
});
