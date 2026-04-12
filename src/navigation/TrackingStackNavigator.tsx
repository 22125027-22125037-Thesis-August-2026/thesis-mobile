import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  ChatScreen,
  DiaryDashboardScreen,
  DiaryEntryScreen,
  DiaryOverviewScreen,
  FoodEntryScreen,
  FoodOverviewScreen,
  HomeScreen,
  SleepEntryScreen,
  SleepOverviewScreen,
} from '@/screens';
import { TrackingStackParamList } from '@/navigation/types';

const TrackingStack = createNativeStackNavigator<TrackingStackParamList>();

const TrackingStackNavigator: React.FC = () => {
  return (
    <TrackingStack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}>
      <TrackingStack.Screen name="Home" component={HomeScreen} />
      <TrackingStack.Screen name="Chat" component={ChatScreen} />
      <TrackingStack.Screen name="SleepOverview" component={SleepOverviewScreen} />
      <TrackingStack.Screen name="SleepEntry" component={SleepEntryScreen} />
      <TrackingStack.Screen name="DiaryOverview" component={DiaryOverviewScreen} />
      <TrackingStack.Screen name="DiaryDashboard" component={DiaryDashboardScreen} />
      <TrackingStack.Screen name="DiaryEntry" component={DiaryEntryScreen} />
      <TrackingStack.Screen name="FoodOverview" component={FoodOverviewScreen} />
      <TrackingStack.Screen name="FoodEntry" component={FoodEntryScreen} />
    </TrackingStack.Navigator>
  );
};

export default TrackingStackNavigator;
