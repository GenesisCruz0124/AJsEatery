import { Stack } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';

export default function TransactionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        animation: 'none',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Transactions' }} />
      <Stack.Screen name="[id]" options={{ title: 'Order Detail' }} />
    </Stack>
  );
}
