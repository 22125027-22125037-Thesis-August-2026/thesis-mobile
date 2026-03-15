import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { sign } from 'react-native-pure-jwt';
import ZoomUs from 'react-native-zoom-us';
import { COLORS } from '../../constants/colors';
import styles from './VideoConsultationScreen.styles';

const ZOOM_APP_KEY = '_fpH9UMMQqWNyO7NS2rhBg';
const ZOOM_APP_SECRET = 'PGVVtMBsIl5DmXEUdcnfwhquvMpeeysX';
const ZOOM_MEETING_NUMBER = '7075120473';
const ZOOM_MEETING_PASSWORD = 'N212sP';

type ZoomTestingJwtPayload = {
  appKey: string;
  sdkKey: string;
  mn: string;
  role: number;
  iat: number;
  exp: number;
  tokenExp: number;
};

const generateTestingToken = async (): Promise<string> => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 172800;

  const payload: ZoomTestingJwtPayload = {
    appKey: ZOOM_APP_KEY,
    sdkKey: ZOOM_APP_KEY,
    mn: ZOOM_MEETING_NUMBER,
    role: 0,
    iat,
    exp,
    tokenExp: exp,
  };

  return sign(payload, ZOOM_APP_SECRET, { alg: 'HS256' });
};

const VideoConsultationScreen: React.FC = () => {
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

        // 1. Comment out the library generator
        // generatedToken = await generateTestingToken();

        // 2. Hardcode your jwt.io token here
        generatedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBLZXkiOiJfZnBIOVVNTVFxV055TzdOUzJyaEJnIiwic2RrS2V5IjoiX2ZwSDlVTU1RcVdOeU83TlMycmhCZyIsIm1uIjoiNzA3NTEyMDQ3MyIsInJvbGUiOjAsImlhdCI6MTc3MzU2MjkyMCwiZXhwIjoxNzczNzM1NzIwLCJ0b2tlbkV4cCI6MTc3MzczNTcyMH0.Y4ahDX0ShaoLAXls08xqpxE7fi41hjgdtWmE7rJATa4';

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
              ? 'JWT token không hợp lệ hoặc không khớp Meeting SDK credentials. Vui lòng tạo lại SDK JWT từ backend.'
              : 'Không thể khởi tạo Zoom. Vui lòng kiểm tra JWT token và thử lại.',
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sẵn sàng kết nối với chuyên gia</Text>

        {isInitializing ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang khởi tạo Zoom...</Text>
          </View>
        ) : isZoomInitialized ? (
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={handleJoinMeeting}>
            <Text style={styles.primaryButtonText}>Mở Zoom & Tham gia</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.loadingWrapper}>
            <Text style={styles.errorText}>{initializationError ?? 'Không thể khởi tạo Zoom.'}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default VideoConsultationScreen;
