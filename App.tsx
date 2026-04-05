import React, { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext, AuthProvider } from './src/context/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import BookingScreen from './src/screens/booking/BookingScreen';
import ConsultationDetailScreen from './src/screens/booking/ConsultationDetailScreen';
import MatchingFormScreen from './src/screens/booking/MatchingFormScreen';
import TherapistDetailScreen from './src/screens/booking/TherapistDetailScreen';
import TherapistFilterScreen from './src/screens/booking/TherapistFilterScreen';
import VideoConsultationScreen from './src/screens/booking/VideoConsultationScreen';
import WaitingRoomScreen from './src/screens/booking/WaitingRoomScreen';
import SleepOverviewScreen from './src/screens/tracking/sleep/SleepOverviewScreen';
import SleepEntryScreen from './src/screens/tracking/sleep/SleepEntryScreen';
import DiaryOverviewScreen from './src/screens/tracking/DiaryOverviewScreen';
import FoodOverviewScreen from './src/screens/tracking/food/FoodOverviewScreen';
import FoodEntryScreen from './src/screens/tracking/food/FoodEntryScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import TherapyOverviewScreen from './src/screens/chat/TherapyOverviewScreen'; 

import { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNav: React.FC = () => {
  const auth = useContext(AuthContext);

  if (!auth || auth.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const userToken = auth.userToken;
  console.log('User Token in AppNav:', userToken);

  return (
    <NavigationContainer>
      {/* 2. ĐỔI initialRouteName THÀNH TherapyOverview */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <>
            {/* 3. ĐĂNG KÝ CẢ 2 MÀN HÌNH VÀO STACK */}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="TherapyOverview" component={TherapyOverviewScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="TherapistFilter" component={TherapistFilterScreen} />
            <Stack.Screen name="MatchingForm" component={MatchingFormScreen} />
            <Stack.Screen name="TherapistDetails" component={TherapistDetailScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="ConsultationDetail" component={ConsultationDetailScreen} />
            <Stack.Screen name="VideoConsultation" component={VideoConsultationScreen} />
            <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
            <Stack.Screen name="SleepOverview" component={SleepOverviewScreen} />
            <Stack.Screen name="SleepEntry" component={SleepEntryScreen} />
            <Stack.Screen name="DiaryOverview" component={DiaryOverviewScreen} />
            <Stack.Screen name="FoodOverview" component={FoodOverviewScreen} />
            <Stack.Screen name="FoodEntry" component={FoodEntryScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppNav />
    </AuthProvider>
  );
};

export default App;