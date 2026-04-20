import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  ChatScreen,
  DiaryEntryScreen,
  DiaryOverviewScreen,
  FoodMainScreen,
  HomeScreen,
  SleepMainScreen,
} from '@/screens';
import { TrackingStackParamList } from '@/navigation/types';

const TrackingStack = createNativeStackNavigator<TrackingStackParamList>();

const TrackingStackNavigator: React.FC = () => {
  return (
    <TrackingStack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <TrackingStack.Screen name="Home" component={HomeScreen} />
      <TrackingStack.Screen name="Chat" component={ChatScreen} />
      <TrackingStack.Screen
        name="DiaryOverview"
        component={DiaryOverviewScreen}
      />
      <TrackingStack.Screen name="DiaryEntry" component={DiaryEntryScreen} />
      <TrackingStack.Screen name="SleepMain" component={SleepMainScreen} />
      <TrackingStack.Screen name="FoodMain" component={FoodMainScreen} />
    </TrackingStack.Navigator>
  );
};

export default TrackingStackNavigator;
