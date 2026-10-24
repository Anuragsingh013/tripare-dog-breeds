import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, AppState, AppStateStatus } from 'react-native';
import { useBreedSync } from '../hooks/useBreedSync';
import { BreedListScreen } from '../screens/BreedListScreen';
import { BreedDetailScreen } from '../screens/BreedDetailScreen';
import { FavouritesScreen } from '../screens/FavouritesScreen';
import { Colors } from '../utils/theme';
import type { BreedsStackParamList, MainTabParamList } from '../types';

const Stack = createStackNavigator<BreedsStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const AppTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.accent,
  },
};

function BreedsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="BreedList" component={BreedListScreen} />
      <Stack.Screen
        name="BreedDetail"
        component={BreedDetailScreen}
        options={{ gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: 4,
          height: 56,
        },
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabel: route.name === 'BreedsTab' ? 'Breeds' : 'Favourites',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ fontSize: size * 0.8, color }}>
            {route.name === 'BreedsTab' ? '🐶' : '❤️'}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="BreedsTab" component={BreedsStack} />
      <Tab.Screen name="FavouritesTab" component={FavouritesScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { performSync } = useBreedSync();

  useEffect(() => {
    performSync(false);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        performSync(false);
      }
    });
    return () => sub.remove();
  }, [performSync]);

  return (
    <NavigationContainer theme={AppTheme}>
      <MainTabs />
    </NavigationContainer>
  );
}