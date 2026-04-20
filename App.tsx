import React, { useContext, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import '@/locales/i18n';

import { AppText } from '@/components';
import { AuthContext, AuthProvider } from '@/context/AuthContext';
import { COLORS } from '@/theme';
import { applyGlobalTypographyDefaults } from '@/theme/applyGlobalTypography';
import {
  AppointmentsHistoryScreen,
  BookingScreen,
  ChatScreen,
  ConsultationDetailScreen,
  ConsultationFeedbackScreen,
  DiaryEntryScreen,
  DiaryOverviewScreen,
  FoodMainScreen,
  HomeScreen,
  LoginScreen,
  MatchingFormScreen,
  MessageListScreen,
  RegisterScreen,
  SocialChatScreen,
  SleepMainScreen,
  TherapistBookingLandingScreen,
  TherapistDetailScreen,
  TherapyOverviewScreen,
  VideoConsultationScreen,
  WaitingRoomScreen,
} from '@/screens';

import { RootStackParamList, MainTabNavigator } from '@/navigation';
import { UserRole } from '@/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

applyGlobalTypographyDefaults();

const ParentExperiencePlaceholderScreen: React.FC = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: COLORS.background,
      }}
    >
      <AppText
        style={{
          fontSize: 22,
          color: COLORS.text,
          marginBottom: 12,
          textAlign: 'center',
        }}
        weight="bold"
      >
        Parent Experience
      </AppText>
      <AppText
        style={{
          fontSize: 15,
          color: COLORS.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
        }}
      >
        Luong trai nghiem cho phu huynh dang duoc hoan thien.
      </AppText>
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
      }}
    >
      <AppText
        style={{
          fontSize: 22,
          color: COLORS.text,
          marginBottom: 12,
          textAlign: 'center',
        }}
        weight="bold"
      >
        Admin Experience
      </AppText>
      <AppText
        style={{
          fontSize: 15,
          color: COLORS.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
        }}
      >
        Khu vuc quan tri hien dang trong giai doan xay dung.
      </AppText>
    </View>
  );
};

const renderTeenExperienceRoutes = () => {
  return (
    <>
      {/* Main Tab Navigator for Teen Experience */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Nested Screens (Deep Linking Stacks) */}
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="MessageList" component={MessageListScreen} />
      <Stack.Screen name="SocialChat" component={SocialChatScreen} />
      <Stack.Screen name="TherapistBookingLanding" component={TherapistBookingLandingScreen} />
      <Stack.Screen name="AppointmentsHistory" component={AppointmentsHistoryScreen} />
      <Stack.Screen name="TherapistFilter" component={TherapistBookingLandingScreen} />
      <Stack.Screen name="MatchingForm" component={MatchingFormScreen} />
      <Stack.Screen name="TherapistDetails" component={TherapistDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="ConsultationDetail" component={ConsultationDetailScreen} />
      <Stack.Screen name="VideoConsultation" component={VideoConsultationScreen} />
      <Stack.Screen name="ConsultationFeedback" component={ConsultationFeedbackScreen} />
      <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
      <Stack.Screen name="DiaryOverview" component={DiaryOverviewScreen} />
      <Stack.Screen name="DiaryEntry" component={DiaryEntryScreen} />
      <Stack.Screen name="SleepMain" component={SleepMainScreen} />
      <Stack.Screen name="FoodMain" component={FoodMainScreen} />
    </>
  );
};

const renderTherapistExperienceRoutes = () => {
  return (
    <>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TherapyOverview" component={TherapyOverviewScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="MessageList" component={MessageListScreen} />
      <Stack.Screen name="SocialChat" component={SocialChatScreen} />
      <Stack.Screen name="ConsultationDetail" component={ConsultationDetailScreen} />
      <Stack.Screen name="VideoConsultation" component={VideoConsultationScreen} />
      <Stack.Screen name="ConsultationFeedback" component={ConsultationFeedbackScreen} />
      <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
    </>
  );
};

const renderRoleBasedRoutes = (role?: UserRole) => {
  if (role === 'THERAPIST') {
    return renderTherapistExperienceRoutes();
  }

  if (role === 'PARENT') {
    return (
      <Stack.Screen
        name="ParentExperience"
        component={ParentExperiencePlaceholderScreen}
      />
    );
  }

  if (role === 'ADMIN') {
    return (
      <Stack.Screen
        name="AdminExperience"
        component={AdminExperiencePlaceholderScreen}
      />
    );
  }

  return renderTeenExperienceRoutes();
};

const AppNav: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const routeNameRef = useRef<string | undefined>(undefined);

  if (!auth || auth.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const { userToken, userInfo } = auth;

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.getCurrentRoute()?.name;
        if (routeNameRef.current) {
          console.log(`[Navigation] Current page: ${routeNameRef.current}`);
        }
      }}
      onStateChange={() => {
        const currentRouteName = navigationRef.getCurrentRoute()?.name;

        if (currentRouteName && routeNameRef.current !== currentRouteName) {
          console.log(`[Navigation] Current page: ${currentRouteName}`);
        }

        routeNameRef.current = currentRouteName;
      }}
    >
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
