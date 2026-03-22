import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import SleepEntryScreen from '../screens/tracking/sleep/SleepEntryScreen';
import SleepOverviewScreen from '../screens/tracking/sleep/SleepOverviewScreen';
import DiaryOverviewScreen from '../screens/tracking/DiaryOverviewScreen';
import FoodOverviewScreen from '../screens/tracking/food/FoodOverviewScreen';
import FoodEntryScreen from '../screens/tracking/food/FoodEntryScreen';
import { TrackingStackParamList } from './types';

const TrackingStack = createNativeStackNavigator<TrackingStackParamList>();

const TrackingStackNavigator: React.FC = () => {
  return (
    <TrackingStack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}>
      <TrackingStack.Screen name="Home" component={HomeScreen} />
      <TrackingStack.Screen name="SleepOverview" component={SleepOverviewScreen} />
      <TrackingStack.Screen name="SleepEntry" component={SleepEntryScreen} />
      <TrackingStack.Screen name="DiaryOverview" component={DiaryOverviewScreen} />
      <TrackingStack.Screen name="FoodOverview" component={FoodOverviewScreen} />
      <TrackingStack.Screen name="FoodEntry" component={FoodEntryScreen} />
    </TrackingStack.Navigator>
  );
};

export default TrackingStackNavigator;
