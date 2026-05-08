import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';
import styles from '@/screens/booking/VideoConsultationScreen.styles';

type VideoConsultationRouteProp = RouteProp<RootStackParamList, 'VideoConsultation'>;
type VideoConsultationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VideoConsultation'
>;

const SERVER_URL = 'https://meet.jit.si';

const sanitizeRoomName = (raw: string): string =>
  raw.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '');

const buildMeetingUri = (room: string, displayName?: string): string => {
  const base = `${SERVER_URL}/${encodeURIComponent(room)}`;
  const config =
    '#config.prejoinPageEnabled=false' +
    '&config.startWithAudioMuted=false' +
    '&config.startWithVideoMuted=false' +
    '&config.disableDeepLinking=true';
  const userInfo = displayName
    ? `&userInfo.displayName=${encodeURIComponent(displayName)}`
    : '';
  return `${base}${config}${userInfo}`;
};

const INJECTED_JS = `
  (function() {
    const post = (type, payload) => window.ReactNativeWebView.postMessage(
      JSON.stringify({ type, payload })
    );
    window.addEventListener('message', (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'video-conference-left') post('left');
        if (data && data.type === 'readyToClose') post('left');
      } catch (e) {}
    });
    true;
  })();
`;

const VideoConsultationScreen: React.FC = () => {
  const navigation = useNavigation<VideoConsultationNavigationProp>();
  const route = useRoute<VideoConsultationRouteProp>();
  const { appointmentId, therapistId, slotId, therapistName } = route.params;

  const defaultRoom = useMemo(() => {
    const seed = appointmentId || slotId || therapistId || 'consultation';
    return sanitizeRoomName(`thesis-${seed}`);
  }, [appointmentId, slotId, therapistId]);

  const [room, setRoom] = useState<string>(defaultRoom);
  const [showMeeting, setShowMeeting] = useState<boolean>(false);

  const meetingUri = useMemo(
    () => buildMeetingUri(room, therapistName),
    [room, therapistName],
  );

  const handleJoin = () => {
    const sanitized = sanitizeRoomName(room);
    if (!sanitized) {
      return;
    }
    const uri = buildMeetingUri(sanitized, therapistName);
    console.log('[VideoConsultation] Jitsi meeting URL:', uri);
    setRoom(sanitized);
    setShowMeeting(true);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const parsed = JSON.parse(event.nativeEvent.data);
      if (parsed?.type === 'left') {
        setShowMeeting(false);
        navigation.goBack();
      }
    } catch {
      // ignore non-JSON messages from the WebView
    }
  };

  if (showMeeting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <WebView
          source={{ uri: meetingUri }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          originWhitelist={['*']}
          onMessage={handleMessage}
          injectedJavaScript={INJECTED_JS}
          onPermissionRequest={(event: any) => event?.nativeEvent?.grant?.(event.nativeEvent.resources)}
          allowsProtectedMedia
          setSupportMultipleWindows={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <AppText style={styles.title}>Tham gia cuộc gọi tham vấn</AppText>

        <TextInput
          style={styles.input}
          value={room}
          onChangeText={setRoom}
          placeholder="Nhập tên phòng Jitsi"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryButton}
          onPress={handleJoin}
        >
          <AppText style={styles.primaryButtonText}>Bắt đầu cuộc gọi</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.endMeetingButton}
          onPress={() => navigation.goBack()}
        >
          <AppText style={styles.primaryButtonText}>Quay lại</AppText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VideoConsultationScreen;
