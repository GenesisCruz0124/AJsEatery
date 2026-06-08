import React from 'react';
import { StyleSheet, View, Image, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { MenuItem } from '../types';
import { formatCurrency } from '../utils/currency';

interface Props {
  item: MenuItem;
  quantityInCart: number;
  onPress: () => void;
}

export function MenuItemCard({ item, quantityInCart, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      android_ripple={{ color: '#00000020' }}
    >
      <View style={styles.imageContainer}>
        {item.image_uri ? (
          <Image source={{ uri: item.image_uri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="restaurant-outline" size={36} color={COLORS.textSecondary} />
          </View>
        )}
        {quantityInCart > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{quantityInCart}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  pressed: { opacity: 0.85 },
  imageContainer: { position: 'relative' },
  image: { width: '100%', aspectRatio: 1 },
  placeholder: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  info: { padding: 8 },
  name: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  price: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
});
