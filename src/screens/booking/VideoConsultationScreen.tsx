import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useZoom } from '@zoom/react-native-videosdk';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoConsultation'>;

const VideoConsultationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const zoom = useZoom();
  const [isInSession, setIsInSession] = useState<boolean>(false);

  useEffect(() => {
    const joinSession = async () => {
      try {
        if (Platform.OS === 'android') {
          const cameraGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA
          );
          const micGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );

          if (
            cameraGranted !== PermissionsAndroid.RESULTS.GRANTED ||
            micGranted !== PermissionsAndroid.RESULTS.GRANTED
          ) {
            setIsInSession(false);
            return;
          }
        }

        await zoom.joinSession({
          sessionName: 'ThesisConsultation',
          token: 'DUMMY_JWT_TOKEN',
          userName: 'User',
          sessionIdleTimeoutMins: 40,
          audioOptions: { connect: true, mute: false },
          videoOptions: { localVideoOn: true },
        });
        setIsInSession(true);
      } catch {
        setIsInSession(false);
      }
    };

    void joinSession();

    return () => {
      void zoom.leaveSession(false);
    };
  }, [zoom]);

  const handleEndCall = async () => {
    await zoom.leaveSession(true);
    navigation.navigate('Home');
  };

  if (!isInSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang kết nối với chuyên gia...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.remoteVideoPlaceholder}>
        <Text style={styles.placeholderText}>Therapist Stream</Text>
      </View>

      <View style={styles.localPipPlaceholder}>
        <Text style={styles.pipText}>You</Text>
      </View>

      <View style={styles.controlBar}>
        <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}>
          <Ionicons name="mic-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}>
          <Ionicons name="videocam-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallButton} activeOpacity={0.8} onPress={handleEndCall}>
          <Ionicons name="call-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.videoBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.videoSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  localPipPlaceholder: {
    position: 'absolute',
    top: 24,
    right: 16,
    width: 110,
    height: 160,
    borderRadius: 12,
    backgroundColor: COLORS.videoPipSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.videoPipBorder,
  },
  pipText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  controlBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 30,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.videoControlBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.videoEndCall,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoConsultationScreen;
