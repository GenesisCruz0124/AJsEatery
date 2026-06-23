import { Stack } from 'expo-router';
import { COLORS } from '../../../../src/constants/colors';

export default function OrderDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        animation: 'none',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Order Detail' }} />
      <Stack.Screen name="payment" options={{ title: 'Payment', gestureEnabled: false }} />
    </Stack>
  );
}
