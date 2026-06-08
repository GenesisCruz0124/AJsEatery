import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName) {
  return ({ color, size }: { color: any; size: number }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { elevation: 8, shadowOpacity: 0.1 },
      }}
    >
      <Tabs.Screen
        name="orders"
        options={{ title: 'Orders', tabBarIcon: tabIcon('receipt-outline') }}
      />
      <Tabs.Screen
        name="kitchen/index"
        options={{ title: 'Kitchen', tabBarIcon: tabIcon('restaurant-outline') }}
      />
      <Tabs.Screen
        name="sales/index"
        options={{ title: 'Sales', tabBarIcon: tabIcon('bar-chart-outline') }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="transactions/index"
        options={{ title: 'Transactions', tabBarIcon: tabIcon('card-outline') }}
      />
      <Tabs.Screen
        name="activation/index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{ title: 'Settings', tabBarIcon: tabIcon('settings-outline') }}
      />
    </Tabs>
  );
}
