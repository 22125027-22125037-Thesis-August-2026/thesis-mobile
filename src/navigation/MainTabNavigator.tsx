import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';

import {
  HomeScreen,
  TherapyOverviewScreen,
  ChatRoomScreen,
  ProfileScreen,
} from '@/screens';
import { TherapistListScreen } from '@/screens/booking';
import { COLORS } from '@/theme';

export type MainTabParamList = {
  HomeTab: undefined;
  AIChatTab: undefined;
  TherapistTab: undefined;
  ChatRoomTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabel: () => null,
        tabBarLabelPosition: 'below-icon',
      }}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* AI Chat Tab */}
      <Tab.Screen
        name="AIChatTab"
        component={TherapyOverviewScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="robot-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Therapist Tab */}
      <Tab.Screen
        name="TherapistTab"
        component={TherapistListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="hospital-box-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Chat Room Tab */}
      <Tab.Screen
        name="ChatRoomTab"
        component={ChatRoomScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-square" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
