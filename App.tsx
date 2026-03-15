import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';

import { RootStackParamList } from './src/navigation/types';



const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNav = () => {
  const { isLoading, userToken } = useContext(AuthContext)!;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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
};

const App = () => {
  return (


      <AuthProvider>
        <AppNav />
      </AuthProvider>



  );
};
