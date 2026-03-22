import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SleepEntryScreen from '../screens/tracking/sleep/SleepEntryScreen';
import SleepOverviewScreen from '../screens/tracking/sleep/SleepOverviewScreen';
import { TrackingStackParamList } from './types';

const TrackingStack = createNativeStackNavigator<TrackingStackParamList>();

const TrackingStackNavigator: React.FC = () => {
  return (
    <TrackingStack.Navigator
      initialRouteName="SleepOverview"
      screenOptions={{ headerShown: false }}>
      <TrackingStack.Screen name="SleepOverview" component={SleepOverviewScreen} />
      <TrackingStack.Screen name="SleepEntry" component={SleepEntryScreen} />
    </TrackingStack.Navigator>
  );
};

export default TrackingStackNavigator;
