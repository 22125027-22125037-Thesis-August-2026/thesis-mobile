// Example: App.tsx (React Native with React Navigation)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// Importing the necessary types for stack navigation
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Updated import  
import TherapistFilterScreen from './src/screens/booking/TherapistFilterScreen';  
import MatchingFormScreen from './src/screens/booking/MatchingFormScreen';
import TherapistDetailScreen from './src/screens/booking/TherapistDetailScreen';
import BookingScreen from './src/screens/booking/BookingScreen';
import WaitingRoomScreen from './src/screens/booking/WaitingRoomScreen';
import ConsultationDetailScreen from './src/screens/booking/ConsultationDetailScreen';
import VideoConsultationScreen from './src/screens/booking/VideoConsultationScreen';
import HomeScreen from './src/screens/HomeScreen';
import { RootStackParamList } from './src/navigation/types';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    
      <NavigationContainer>
        <Stack.Navigator initialRouteName="TherapistFilter" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="TherapistFilter" component={TherapistFilterScreen} />
          <Stack.Screen name="MatchingForm" component={MatchingFormScreen} />
          <Stack.Screen name="TherapistDetails" component={TherapistDetailScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="ConsultationDetail" component={ConsultationDetailScreen} />
          <Stack.Screen name="VideoConsultation" component={VideoConsultationScreen} />
          <Stack.Screen
            name="WaitingRoom"
            component={WaitingRoomScreen}
            options={{ headerShown: false }}
          />
          {/* other screens */}
        </Stack.Navigator>
      </NavigationContainer>
  
  );
}