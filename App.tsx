import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, View } from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { EventType } from '@notifee/react-native';
import '@/locales/i18n';

// Must be registered before the app renders so Notifee can wake the JS thread
// when a local notification is pressed while the app is in background/quit state.
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    const target = detail.notification?.data?.target as string | undefined;
    if (target) {
      await AsyncStorage.setItem('@pending_notifee_target', target);
    }
  }
});

import { AppText } from '@/components';
import { AuthContext, AuthProvider } from '@/context/AuthContext';
import { listenForForegroundNotifications } from '@/services/notifications';
import {
  WidgetBridge,
  WIDGET_DEEP_LINK_EVENT,
  WidgetDeepLinkPayload,
} from '@/native/WidgetBridge';
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
  FriendProfileScreen,
  HomeScreen,
  LoginScreen,
  TermsScreen,
  MatchingFormScreen,
  MessageListScreen,
  NotificationScreen,
  NotificationDetailScreen,
  OnboardingScreen,
  RegisterScreen,
  SocialChatScreen,
  SleepMainScreen,
  StepMainScreen,
  BreathingExerciseScreen,
  SplashScreen,
  TherapistDetailScreen,
  TherapyOverviewScreen,
  VideoConsultationScreen,
  WaitingRoomScreen,
} from '@/screens';
import ProfileEditScreen from '@/screens/profile/ProfileEditScreen';
import FAQScreen from '@/screens/profile/FAQScreen';
import AboutScreen from '@/screens/profile/AboutScreen';
import ContactScreen from '@/screens/profile/ContactScreen';

const ONBOARDING_KEY = 'hasSeenOnboarding';

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
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
      <Stack.Screen name="SocialChat" component={SocialChatScreen} />
      <Stack.Screen name="AppointmentsHistory" component={AppointmentsHistoryScreen} />
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
      <Stack.Screen name="StepMain" component={StepMainScreen} />
      <Stack.Screen name="BreathingMain" component={BreathingExerciseScreen} />
      <Stack.Screen name="FoodMain" component={FoodMainScreen} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
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
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(val => {
      setHasSeenOnboarding(val === 'true');
    });
  }, []);

  useEffect(() => {
    const unsubscribe = listenForForegroundNotifications();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleTarget = useCallback(
    (target: string | null | undefined): void => {
      if (!target) return;
      if (!navigationRef.isReady()) return;
      if ((target === 'diary-new' || target === 'mood-add') && auth?.userToken) {
        navigationRef.navigate('DiaryEntry' as never);
      } else if (target === 'login' && !auth?.userToken) {
        navigationRef.navigate('Login' as never);
      }
    },
    [auth?.userToken, navigationRef],
  );

  // Widget deep links
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      WIDGET_DEEP_LINK_EVENT,
      (payload: WidgetDeepLinkPayload) => handleTarget(payload?.target),
    );
    void WidgetBridge.consumePendingDeepLink().then(handleTarget);
    return () => subscription.remove();
  }, [handleTarget]);

  // Notifee local notification press — foreground
  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const target = detail.notification?.data?.target as string | undefined;
        handleTarget(target);
      }
    });
  }, [handleTarget]);

  // Notifee local notification press — background/quit (pending target stored by onBackgroundEvent)
  useEffect(() => {
    AsyncStorage.getItem('@pending_notifee_target').then(target => {
      if (target) {
        AsyncStorage.removeItem('@pending_notifee_target');
        handleTarget(target);
      }
    });
  }, [handleTarget]);

  const markOnboardingDone = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
  };

  if (!auth || auth.isLoading || hasSeenOnboarding === null) {
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
          <>
            {renderRoleBasedRoutes(userInfo?.role)}
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Contact" component={ContactScreen} />
          </>
        ) : !hasSeenOnboarding ? (
          <>
            <Stack.Screen name="Splash">
              {() => <SplashScreen onDone={() => {
                navigationRef.current?.navigate('Onboarding');
              }} />}
            </Stack.Screen>
            <Stack.Screen name="Onboarding">
              {() => (
                <OnboardingScreen
                  onFinish={async () => {
                    await markOnboardingDone();
                    navigationRef.current?.navigate('Register');
                  }}
                  onSkip={async () => {
                    await markOnboardingDone();
                    navigationRef.current?.navigate('Login');
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
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
