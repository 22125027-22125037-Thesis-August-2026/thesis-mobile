import React, { useContext } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext, AuthProvider } from './src/context/AuthContext';
import { COLORS } from './src/constants/colors';
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
import DiaryOverviewScreen from './src/screens/tracking/diary/DiaryOverviewScreen';
import DiaryDashboardScreen from './src/screens/tracking/diary/DiaryDashboardScreen';
import DiaryEntryScreen from './src/screens/tracking/diary/DiaryEntryScreen';
import FoodOverviewScreen from './src/screens/tracking/food/FoodOverviewScreen';
import FoodEntryScreen from './src/screens/tracking/food/FoodEntryScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import TherapyOverviewScreen from './src/screens/chat/TherapyOverviewScreen'; 

import { RootStackParamList } from './src/navigation/types';
import { UserRole } from './src/types/auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

const ParentExperiencePlaceholderScreen: React.FC = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: COLORS.background,
      }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: COLORS.text,
          marginBottom: 12,
          textAlign: 'center',
        }}>
        Parent Experience
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: COLORS.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
        }}>
        Luong trai nghiem cho phu huynh dang duoc hoan thien.
      </Text>
    </View>
  );
};

const AdminExperiencePlaceholderScreen: React.FC = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: COLORS.background,
      }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: COLORS.text,
          marginBottom: 12,
          textAlign: 'center',
        }}>
        Admin Experience
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: COLORS.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
        }}>
        Khu vuc quan tri hien dang trong giai doan xay dung.
      </Text>
    </View>
  );
};

const renderTeenExperienceRoutes = () => {
  return (
    <>
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
      <Stack.Screen name="DiaryDashboard" component={DiaryDashboardScreen} />
      <Stack.Screen name="DiaryEntry" component={DiaryEntryScreen} />
      <Stack.Screen name="FoodOverview" component={FoodOverviewScreen} />
      <Stack.Screen name="FoodEntry" component={FoodEntryScreen} />
    </>
  );
};

const renderTherapistExperienceRoutes = () => {
  return (
    <>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TherapyOverview" component={TherapyOverviewScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ConsultationDetail" component={ConsultationDetailScreen} />
      <Stack.Screen name="VideoConsultation" component={VideoConsultationScreen} />
      <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
    </>
  );
};

const renderRoleBasedRoutes = (role?: UserRole) => {
  if (role === 'THERAPIST') {
    return renderTherapistExperienceRoutes();
  }

  if (role === 'PARENT') {
    return <Stack.Screen name="ParentExperience" component={ParentExperiencePlaceholderScreen} />;
  }

  if (role === 'ADMIN') {
    return <Stack.Screen name="AdminExperience" component={AdminExperiencePlaceholderScreen} />;
  }

  return renderTeenExperienceRoutes();
};

const AppNav: React.FC = () => {
  const auth = useContext(AuthContext);

  if (!auth || auth.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const { userToken, userInfo } = auth;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          renderRoleBasedRoutes(userInfo?.role)
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