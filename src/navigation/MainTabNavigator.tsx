import React, { useCallback, useRef } from 'react';
import {
  BottomTabBarButtonProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  HomeScreen,
  TherapyOverviewScreen,
  MessageListScreen,
  ProfileScreen,
} from '@/screens';
import { useTourTarget } from '@/components/tour';
import { TOUR_TARGETS, TourTargetKey } from '@/constants/tour';
import { TherapistBookingLandingScreen } from '@/screens/booking';
import { useSeedTrackingCache } from '@/hooks';
import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';

export type MainTabParamList = {
  HomeTab: undefined;
  AIChatTab: undefined;
  TherapistTab: undefined;
  ChatRoomTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Nút tab tự đăng ký làm "target" cho tour coach-mark (để overlay đo được vị trí
// và khoét sáng đúng tab), đồng thời giữ nguyên hành vi nhấn mặc định.
const TourTabBarButton: React.FC<
  BottomTabBarButtonProps & { tourKey: TourTargetKey }
> = ({ tourKey, children, onPress, onLongPress, accessibilityState, accessibilityLabel, testID }) => {
  const { ref, onLayout } = useTourTarget(tourKey);
  return (
    <Pressable
      ref={ref}
      onLayout={onLayout}
      collapsable={false}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      android_ripple={{ borderless: true }}
      style={tabStyles.tabButton}
    >
      {children}
    </Pressable>
  );
};

const tabStyles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const makeTabBarButton =
  (tourKey: TourTargetKey) =>
  (props: BottomTabBarButtonProps): React.ReactNode =>
    <TourTabBarButton {...props} tourKey={tourKey} />;
const TAB_ROUTE_NAMES: Array<keyof MainTabParamList> = [
  'HomeTab',
  'AIChatTab',
  'TherapistTab',
  'ChatRoomTab',
  'ProfileTab',
];

const MainTabNavigator: React.FC = () => {
  const { t } = useTranslation();
  const parentNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const lastBackPressRef = useRef<number | null>(null);

  // Seed the popup cache with real server data once per day so celebration
  // sheets always show the correct trophy tier, independent of which tab the
  // user visits first.
  useSeedTrackingCache();

  const getActiveTabName = useCallback((): keyof MainTabParamList => {
    const parentState = parentNavigation.getState();
    const activeRoute = parentState.routes[parentState.index];
    const nestedState = activeRoute?.state;

    if (
      nestedState &&
      typeof nestedState.index === 'number' &&
      Array.isArray(nestedState.routes)
    ) {
      const nestedRoute = nestedState.routes[nestedState.index];
      const nestedName = nestedRoute?.name as keyof MainTabParamList | undefined;
      if (nestedName && TAB_ROUTE_NAMES.includes(nestedName)) {
        return nestedName;
      }
    }

    const routeName = activeRoute?.name as keyof MainTabParamList | undefined;
    if (routeName && TAB_ROUTE_NAMES.includes(routeName)) {
      return routeName;
    }

    return 'HomeTab';
  }, [parentNavigation]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return undefined;
      }

      const onBackPress = () => {
        const activeRouteName = getActiveTabName();
        if (activeRouteName !== 'HomeTab') {
          lastBackPressRef.current = null;
          parentNavigation.navigate('MainTabs', { screen: 'HomeTab' });
          return true;
        }

        const now = Date.now();
        if (lastBackPressRef.current && now - lastBackPressRef.current < 2000) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPressRef.current = now;
        ToastAndroid.show(t('common.backToExit'), ToastAndroid.SHORT);
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [getActiveTabName, parentNavigation, t]),
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabel: () => null,
        tabBarLabelPosition: 'below-icon',
      }}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarButton: makeTabBarButton(TOUR_TARGETS.tabHome),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* AI Chat Tab */}
      <Tab.Screen
        name="AIChatTab"
        component={TherapyOverviewScreen}
        options={{
          tabBarButton: makeTabBarButton(TOUR_TARGETS.tabAi),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="robot-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Therapist Tab */}
      <Tab.Screen
        name="TherapistTab"
        component={TherapistBookingLandingScreen}
        options={{
          tabBarButton: makeTabBarButton(TOUR_TARGETS.tabTherapist),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="hospital-box-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Chat Room Tab */}
      <Tab.Screen
        name="ChatRoomTab"
        component={MessageListScreen}
        options={{
          tabBarButton: makeTabBarButton(TOUR_TARGETS.tabChat),
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-square" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarButton: makeTabBarButton(TOUR_TARGETS.tabProfile),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
