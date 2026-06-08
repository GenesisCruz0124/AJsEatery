import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TextInput, Button, Switch, Text, SegmentedButtons, Snackbar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { ImagePickerButton } from '../../../src/components/ImagePickerButton';
import { COLORS } from '../../../src/constants/colors';
import * as menuRepository from '../../../src/repositories/menuRepository';

const CATEGORIES = ['Food', 'Drinks', 'Others'];

export default function ProductFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Food');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: isNew ? 'Add Product' : 'Edit Product' });
  }, [isNew, navigation]);

  useEffect(() => {
    if (isNew) return;
    menuRepository.getMenuItemById(Number(id)).then((item) => {
      if (!item) return;
      setName(item.name);
      setPrice(item.price.toString());
      setCategory(item.category);
      setImageUri(item.image_uri);
      setIsAvailable(item.is_available === 1);
      setLoading(false);
    });
  }, [id, isNew]);

  async function save() {
    if (!name.trim()) { setSnack('Name is required.'); return; }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) { setSnack('Enter a valid price.'); return; }

    setSaving(true);
    try {
      await menuRepository.upsertMenuItem({
        id: isNew ? undefined : Number(id),
        name: name.trim(),
        price: parsedPrice,
        category,
        image_uri: imageUri,
        is_available: isAvailable ? 1 : 0,
      });
      router.back();
    } catch {
      setSnack('Failed to save product.');
      setSaving(false);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ImagePickerButton uri={imageUri} onImageSelected={setImageUri} />

        <TextInput
          label="Product Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Price (₱)"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.input}
          left={<TextInput.Affix text="₱" />}
        />

        <Text style={styles.sectionLabel}>Category</Text>
        <SegmentedButtons
          value={category}
          onValueChange={setCategory}
          buttons={CATEGORIES.map((c) => ({ value: c, label: c }))}
          style={styles.segmented}
        />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Available in menu</Text>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            color={COLORS.primary}
          />
        </View>

        <Button
          mode="contained"
          buttonColor={COLORS.primary}
          onPress={save}
          loading={saving}
          disabled={saving}
          style={styles.saveBtn}
          labelStyle={{ fontSize: 16 }}
        >
          {isNew ? 'Add Product' : 'Save Changes'}
        </Button>
      </ScrollView>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, gap: 12 },
  input: { backgroundColor: '#fff' },
  sectionLabel: { fontWeight: '600', color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  segmented: {},
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
  },
  toggleLabel: { fontSize: 15, color: COLORS.text },
  saveBtn: { marginTop: 8, borderRadius: 10, paddingVertical: 4 },
});
