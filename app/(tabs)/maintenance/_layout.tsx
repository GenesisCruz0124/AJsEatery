import { Stack } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';

export default function MaintenanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Products' }} />
      <Stack.Screen name="[id]" options={{ title: 'Product' }} />
    </Stack>
  );
}
