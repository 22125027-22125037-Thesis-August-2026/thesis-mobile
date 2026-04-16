// src/screens/booking/TherapistFilterScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '@/theme';
import styles from '@/screens/booking/TherapistFilterScreen.styles';
import { RootStackParamList } from '@/navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '@/components';
import { ActiveAssignedTherapist, getActiveAssignedTherapist } from '@/api';
import { AuthContext } from '@/context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TherapistBookingLanding'>;

const TherapistFilterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const auth = useContext(AuthContext);
  const profileId = auth?.userInfo?.profileId;
  const [activeTherapist, setActiveTherapist] = useState<ActiveAssignedTherapist | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchActiveTherapist = async () => {
      if (!profileId) {
        if (isMounted) {
          setActiveTherapist(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const therapist = await getActiveAssignedTherapist(profileId);
        if (isMounted) {
          setActiveTherapist(therapist);
        }
      } catch (error) {
        console.error('[TherapistFilterScreen] Failed to load active therapist:', error);
        if (isMounted) {
          setActiveTherapist(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchActiveTherapist();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const handleNavigateMatchingForm = () => {
    navigation.navigate('MatchingForm');
  };

  const handleChatAction = () => {
    if (!activeTherapist) {
      navigation.navigate('MatchingForm');
      return;
    }

    navigation.navigate('Chat');
  };

  return (
    <View style={styles.container}>
      {/* Curved Green Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <AppText style={styles.brandText}>uMatter</AppText>
        <AppText style={styles.subHeader}>
          Kết nối và trò chuyện cùng chuyên gia trị liệu phù hợp với bạn
        </AppText>
        <Image
          source={require('../../assets/booking/doctor.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      {/* Scrollable Filter Content with Leaf Background */}
      <ImageBackground
        source={require('../../assets/booking/leaf_bg.png')}
        style={styles.leafBackground}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <AppText style={styles.loadingText}>Đang tải chuyên gia của bạn...</AppText>
            </View>
          ) : null}

          {activeTherapist ? (
            <View style={styles.therapistCard}>
              <Image
                source={
                  activeTherapist.avatarUrl
                    ? { uri: activeTherapist.avatarUrl }
                    : require('../../assets/booking/doctor.png')
                }
                style={styles.therapistAvatar}
                resizeMode="cover"
              />
              <View style={styles.therapistInfo}>
                <AppText style={styles.therapistName}>{activeTherapist.fullName}</AppText>
                <AppText style={styles.therapistSpecialization}>
                  {activeTherapist.specialization}
                </AppText>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                  <AppText style={styles.locationText}>{activeTherapist.location}</AppText>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <AppText style={styles.emptyCardTitle}>Bạn chưa có chuyên gia đang hoạt động</AppText>
              <AppText style={styles.emptyCardText}>
                Hoàn tất bảng ghép nối để hệ thống đề xuất chuyên gia phù hợp cho bạn.
              </AppText>
            </View>
          )}
        </ScrollView>
      </ImageBackground>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {activeTherapist ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleNavigateMatchingForm}
            activeOpacity={0.85}
          >
            <AppText style={styles.actionButtonText}>Tôi muốn đổi chuyên gia</AppText>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={handleChatAction}
          activeOpacity={0.85}
        >
          <AppText style={styles.actionButtonText}>Trò chuyện với chuyên gia</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TherapistFilterScreen;
