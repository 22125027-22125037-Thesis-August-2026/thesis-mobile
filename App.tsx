// Example: App.tsx (React Native with React Navigation)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// Importing the necessary types for stack navigation
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Updated import  
import TherapistFilterScreen from './src/screens/booking/TherapistFilterScreen';  

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TherapistFilter">
        <Stack.Screen name="TherapistFilter" component={TherapistFilterScreen} />
        {/* other screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}