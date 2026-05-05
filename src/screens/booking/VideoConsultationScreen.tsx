import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ZoomUs from 'react-native-zoom-us';
import { COLORS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import styles from '@/screens/booking/VideoConsultationScreen.styles';
import { therapistApi } from '@/api';

type VideoConsultationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoConsultation'>;
type VideoConsultationRouteProp = RouteProp<RootStackParamList, 'VideoConsultation'>;

type BackendErrorPayload = {
  message?: string;
  error?: string;
};

const VideoConsultationScreen: React.FC = () => {
  const navigation = useNavigation<VideoConsultationNavigationProp>();
  const route = useRoute<VideoConsultationRouteProp>();
  const { t } = useTranslation();
  const appointmentId = route.params?.appointmentId;
  const [isZoomInitialized, setIsZoomInitialized] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [meetingNumber, setMeetingNumber] = useState<string>('');
  const [meetingPassword, setMeetingPassword] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const initializeZoom = async (): Promise<void> => {
      try {
        if (isMounted) {
          setIsInitializing(true);
          setInitializationError(null);
        }

        if (!appointmentId) {
          throw new Error(t('booking.videoConsultation.initError'));
        }

        const { sdkJwt, meetingNumber: fetchedMeetingNumber, password } =
          await therapistApi.getVideoConsultationJoin(appointmentId);

        if (isMounted) {
          setMeetingNumber(fetchedMeetingNumber);
          setMeetingPassword(password);
        }

        await ZoomUs.initialize({
          jwtToken: sdkJwt,
        });

        if (isMounted) {
          setIsZoomInitialized(true);
          setIsInitializing(false);
        }
      } catch (error: unknown) {
        const errorMessage =
          typeof error === 'object' && error && 'response' in error
            ? ((error as { response?: { data?: BackendErrorPayload } }).response?.data?.message ??
                (error as { response?: { data?: BackendErrorPayload } }).response?.data?.error ??
                t('booking.videoConsultation.initError'))
            : error instanceof Error
              ? error.message
              : t('booking.videoConsultation.initError');

        if (isMounted) {
          setIsZoomInitialized(false);
          setIsInitializing(false);
          setInitializationError(errorMessage);
        }
      }
    };

    void initializeZoom();

    return () => {
      isMounted = false;
    };
  }, [appointmentId, t]);

  const handleJoinMeeting = async (): Promise<void> => {
    await ZoomUs.joinMeeting({
      userName: 'Bệnh nhân',
      meetingNumber: meetingNumber.replace(/\s/g, ''),
      password: meetingPassword,
    });
  };

  const handleEndMeeting = (): void => {
    /*
     * TODO: Implement logic to trigger this navigation automatically if the user exits
     * the Zoom meeting less than 5 minutes before the scheduled end time, marking
     * the session as complete.
     *
     * Suggested business flow:
     * 1. Subscribe to Zoom meeting leave/end callbacks and capture actual exit timestamp.
     * 2. Compare actual exit timestamp with scheduled end timestamp from backend booking data.
     * 3. If delta is <= 5 minutes, call session-completion API and persist completion status.
     * 4. If completion API succeeds, navigate to ConsultationFeedback for post-session review.
     * 5. If completion API fails, show retry/error state and avoid navigating prematurely.
     */
    navigation.navigate('ConsultationFeedback', {
      ...route.params,
      endedAt: new Date().toISOString(),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppText style={styles.title}>{t('booking.videoConsultation.readyTitle')}</AppText>

        {isInitializing ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <AppText style={styles.loadingText}>{t('booking.videoConsultation.initializingText')}</AppText>
          </View>
        ) : isZoomInitialized ? (
          <View style={styles.loadingWrapper}>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={handleJoinMeeting}>
              <AppText style={styles.primaryButtonText}>{t('booking.videoConsultation.joinButton')}</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endMeetingButton} activeOpacity={0.85} onPress={handleEndMeeting}>
              <AppText style={styles.primaryButtonText}>{t('booking.videoConsultation.endButton')}</AppText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loadingWrapper}>
            <AppText style={styles.errorText}>{initializationError ?? t('booking.videoConsultation.defaultError')}</AppText>
          </View>
        )}
      </View>
    </View>
  );
};

export default VideoConsultationScreen;
