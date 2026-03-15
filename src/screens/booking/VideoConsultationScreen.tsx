import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import ZoomUs from 'react-native-zoom-us';
import { COLORS } from '../../constants/colors';
import styles from './VideoConsultationScreen.styles';

const ZOOM_CLIENT_KEY = '4RrPqE3Sl6sxY7VaZo1w';
const ZOOM_CLIENT_SECRET = 'rHpejFnt45tCgSDqBIN1xS0ZLG6otCj5';
const ZOOM_MEETING_NUMBER = '707 512 0473';
const ZOOM_MEETING_PASSWORD = 'N212sP';

const VideoConsultationScreen: React.FC = () => {
  const [isZoomInitialized, setIsZoomInitialized] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const initializeZoom = async (): Promise<void> => {
      try {
        await ZoomUs.initialize({
          clientKey: ZOOM_CLIENT_KEY,
          clientSecret: ZOOM_CLIENT_SECRET,
        });

        if (isMounted) {
          setIsZoomInitialized(true);
        }
      } catch {
        if (isMounted) {
          setIsZoomInitialized(false);
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
      meetingNumber: ZOOM_MEETING_NUMBER,
      password: ZOOM_MEETING_PASSWORD,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sẵn sàng kết nối với chuyên gia</Text>

        {isZoomInitialized ? (
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={handleJoinMeeting}>
            <Text style={styles.primaryButtonText}>Mở Zoom & Tham gia</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang khởi tạo Zoom...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default VideoConsultationScreen;
