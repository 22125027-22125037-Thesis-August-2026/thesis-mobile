import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DiaryDashboardScreen from '../screens/tracking/DiaryDashboardScreen';
import DiaryEntryScreen from '../screens/tracking/DiaryEntryScreen';
import DiaryOverviewScreen from '../screens/tracking/DiaryOverviewScreen';
import { TrackingStackParamList } from './types';

const TrackingStack = createNativeStackNavigator<TrackingStackParamList>();

const TrackingStackNavigator: React.FC = () => {
  return (
    <TrackingStack.Navigator screenOptions={{ headerShown: false }}>
      <TrackingStack.Screen name="DiaryOverview" component={DiaryOverviewScreen} />
      <TrackingStack.Screen name="DiaryDashboard" component={DiaryDashboardScreen} />
      <TrackingStack.Screen name="DiaryEntry" component={DiaryEntryScreen} />
    </TrackingStack.Navigator>
  );
};

export default TrackingStackNavigator;
