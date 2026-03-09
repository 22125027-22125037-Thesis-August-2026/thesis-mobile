// Example: App.tsx (React Native with React Navigation)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// Importing the necessary types for stack navigation
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Updated import
import TherapistListScreen from './src/screens/booking/TherapistListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TherapistList">
        <Stack.Screen name="TherapistList" component={TherapistListScreen} />
        {/* other screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}