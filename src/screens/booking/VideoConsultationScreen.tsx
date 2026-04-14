import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import CryptoJS from 'crypto-js';
import ZoomUs from 'react-native-zoom-us';
import { COLORS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import styles from '@/screens/booking/VideoConsultationScreen.styles';

const ZOOM_APP_KEY = '_fpH9UMMQqWNyO7NS2rhBg';
const ZOOM_APP_SECRET = 'PGVVtMBsIl5DmXEUdcnfwhquvMpeeysX';
const ZOOM_MEETING_NUMBER = '7075120473';
const ZOOM_MEETING_PASSWORD = 'N212sP';

type ZoomTestingJwtPayload = {
  appKey: string;
  iat: number;
  exp: number;
  tokenExp: number;
};

type VideoConsultationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoConsultation'>;

const base64url = (source: CryptoJS.lib.WordArray): string => {
  let encodedSource = CryptoJS.enc.Base64.stringify(source);
  encodedSource = encodedSource.replace(/=+$/, '');
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');
  return encodedSource;
};

const generateTestingToken = async (): Promise<string> => {
  // Buffer iat slightly to avoid device clock drift issues vs Zoom servers.
  const iat = Math.floor(Date.now() / 1000) - 30;
  // Keep token lifetime short to stay under strict SDK JWT validation limits.
  const exp = iat + 7200;

  const payload: ZoomTestingJwtPayload = {
    appKey: ZOOM_APP_KEY,
    iat,
    exp,
    tokenExp: exp,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
  const encodedHeader = base64url(stringifiedHeader);

  const stringifiedPayload = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
  const encodedPayload = base64url(stringifiedPayload);

  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signed = CryptoJS.HmacSHA256(signatureInput, ZOOM_APP_SECRET);
  const encodedSignature = base64url(signed);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};

const VideoConsultationScreen: React.FC = () => {
  const navigation = useNavigation<VideoConsultationNavigationProp>();
  const { t } = useTranslation();
  const [isZoomInitialized, setIsZoomInitialized] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeZoom = async (): Promise<void> => {
      let generatedToken = '';

      try {
        if (isMounted) {
          setIsInitializing(true);
          setInitializationError(null);
        }

        generatedToken = await generateTestingToken();

        // --- ADD THIS DEBUG BLOCK ---
        console.log('\n=== TOKEN DEBUG ===');
        console.log('1. Device Time:', new Date().toISOString());
        console.log('2. Generated Token:', generatedToken);
        console.log('===================\n');

        await ZoomUs.initialize({
          jwtToken: generatedToken,
        });

        if (isMounted) {
          setIsZoomInitialized(true);
          setIsInitializing(false);
        }
      } catch (error: unknown) {
        console.error('[Zoom Debug] Initialization Error:', error);

        const errorMessage = error instanceof Error ? error.message : String(error);
        const isTokenCredentialError = errorMessage.includes('internalErrorCode=124');
        const sanitizedMeetingNumber = ZOOM_MEETING_NUMBER.replace(/\s/g, '');

        console.error('[Zoom Debug] Init Context:', {
          appKey: ZOOM_APP_KEY,
          meetingNumber: sanitizedMeetingNumber,
          jwtTokenLength: generatedToken.length,
          jwtTokenPreview: generatedToken
            ? `${generatedToken.slice(0, 12)}...${generatedToken.slice(-8)}`
            : 'not-generated',
        });

        if (isMounted) {
          setIsZoomInitialized(false);
          setIsInitializing(false);
          setInitializationError(
            isTokenCredentialError
              ? t('booking.videoConsultation.invalidTokenError')
              : t('booking.videoConsultation.initError'),
          );
        }
      }
    };

    void initializeZoom();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleJoinMeeting = async (): Promise<void> => {
    await ZoomUs.joinMeeting({
      userName: 'Bệnh nhân',
      meetingNumber: ZOOM_MEETING_NUMBER.replace(/\s/g, ''),
      password: ZOOM_MEETING_PASSWORD,
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
    navigation.navigate('ConsultationFeedback');
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
