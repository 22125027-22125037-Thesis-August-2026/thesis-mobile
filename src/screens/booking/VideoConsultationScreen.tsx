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
    '&config.disableDeepLinking=true' +
    // Force Vietnamese UI and disable browser-locale auto-detection.
    // Jitsi parses hash values as JSON, so the language code must be a quoted string.
    '&config.defaultLanguage=%22vi%22' +
    '&interfaceConfig.LANG_DETECTION=false';
  const userInfo = displayName
    ? `&userInfo.displayName=${encodeURIComponent(displayName)}`
    : '';
  return `${base}${config}${userInfo}`;
};

const INJECTED_JS = `
  (function() {
    var OVERLAY_ID = 'rn-waiting-overlay';

    // --- Force Vietnamese locale ---------------------------------------------
    // meet.jit.si's i18next picks language from navigator.language first, and
    // config.defaultLanguage is only a fallback. The WebView reports the host
    // OS locale (Spanish here), so we have to override the navigator getters
    // BEFORE any Jitsi script reads them. This block must run inside
    // injectedJavaScriptBeforeContentLoaded for the override to land in time.
    try {
      Object.defineProperty(navigator, 'language', {
        get: function() { return 'vi-VN'; },
        configurable: true,
      });
      Object.defineProperty(navigator, 'languages', {
        get: function() { return ['vi-VN', 'vi']; },
        configurable: true,
      });
    } catch (e) {}
    try {
      localStorage.setItem('i18nextLng', 'vi');
      localStorage.setItem('language', 'vi');
    } catch (e) {}
    try {
      document.cookie = 'i18next=vi; path=/';
    } catch (e) {}
    // If Jitsi's APP.translation is already initialised by the time the
    // post-content injection runs, force a re-translate to catch up.
    var forceLang = function() {
      try {
        if (window.APP && window.APP.translation &&
            typeof window.APP.translation.changeLanguage === 'function') {
          window.APP.translation.changeLanguage('vi');
        }
        if (window.i18next && typeof window.i18next.changeLanguage === 'function') {
          window.i18next.changeLanguage('vi');
        }
      } catch (e) {}
    };
    forceLang();
    setTimeout(forceLang, 500);
    setTimeout(forceLang, 2000);

    var post = function(type, payload) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
      }
    };

    // Hide every path that leads to Google/GitHub moderator auth.
    // Class names on meet.jit.si shift between releases — keep this list broad.
    var injectStyles = function() {
      if (document.getElementById('rn-jitsi-hide-auth')) return;
      var style = document.createElement('style');
      style.id = 'rn-jitsi-hide-auth';
      style.innerHTML = [
        '[data-testid="lobby.iAmHost"],',
        '[data-testid="prejoin.iAmHost"],',
        '[data-testid="dialog.login"],',
        '.login-button,',
        '.auth-button,',
        'button[class*="LoginButton"],',
        'button[class*="loginButton"],',
        'button[class*="iAmHost"],',
        'a[href*="accounts.google.com"],',
        'a[href*="github.com/login"],',
        '.auth-dialog,',
        '.login-dialog {',
        '  display: none !important;',
        '  visibility: hidden !important;',
        '  pointer-events: none !important;',
        '}'
      ].join('');
      document.head.appendChild(style);
    };

    var ensureOverlay = function() {
      if (document.getElementById(OVERLAY_ID)) return;
      var overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;
      overlay.style.cssText = [
        'position:fixed','top:0','left:0','right:0','bottom:0',
        'z-index:2147483647','display:none','flex-direction:column',
        'align-items:center','justify-content:center',
        'background:rgba(0,0,0,0.92)','color:#fff',
        'font-family:system-ui,-apple-system,sans-serif',
        'padding:24px','text-align:center'
      ].join(';');
      overlay.innerHTML = [
        '<div style="font-size:18px;font-weight:600;margin-bottom:12px">',
        '  Đang chờ chuyên viên tham vấn vào phòng…',
        '</div>',
        '<div style="font-size:14px;opacity:0.85;max-width:320px;line-height:1.5;margin-bottom:28px">',
        '  Vui lòng đợi một lát. Cuộc gọi sẽ tự động bắt đầu khi chuyên viên tham gia.',
        '</div>',
        '<button id="rn-back-btn" style="',
        '  background:#dc2626;color:#fff;border:none;',
        '  padding:14px 36px;font-size:16px;font-weight:600;',
        '  border-radius:10px;cursor:pointer;',
        '  font-family:inherit;letter-spacing:0.3px;">',
        '  Quay lại',
        '</button>'
      ].join('');
      (document.body || document.documentElement).appendChild(overlay);
      var backBtn = overlay.querySelector('#rn-back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          post('left');
        });
      }
    };

    // Bind the Jitsi hangup button so the RN side knows when to leave the
    // meeting view. data-testid is locale-independent, so it survives the
    // Vietnamese UI override.
    var bindHangup = function() {
      var btn = document.querySelector('[data-testid="toolbox.hangup"]');
      if (btn && !btn.__rnBound) {
        btn.__rnBound = true;
        btn.addEventListener('click', function() {
          setTimeout(function() { post('left'); }, 200);
        });
      }
    };

    // If meet.jit.si pops an auth/login dialog, auto-dismiss it so the user
    // is held on the built-in "Waiting for the host…" screen.
    var dismissAuthDialogs = function() {
      var cancelSelectors = [
        '[data-testid="dialog.cancel"]',
        '[data-testid="dialog.close"]',
        '.auth-dialog button[aria-label*="ancel"]',
        '.login-dialog button[aria-label*="ancel"]'
      ];
      cancelSelectors.forEach(function(sel) {
        document.querySelectorAll(sel).forEach(function(btn) {
          var inAuth = btn.closest('.auth-dialog, .login-dialog, [class*="auth"], [class*="login"]');
          if (inAuth) {
            try { btn.click(); } catch (e) {}
          }
        });
      });
    };

    // Show our Vietnamese overlay whenever Jitsi shows its lobby/waiting screen.
    var syncOverlayVisibility = function() {
      var overlay = document.getElementById(OVERLAY_ID);
      if (!overlay) return;
      var waiting =
        document.querySelector('[class*="lobby"]') ||
        document.querySelector('[class*="Lobby"]') ||
        document.querySelector('[class*="waiting"]') ||
        document.querySelector('[data-testid*="lobby"]');
      overlay.style.display = waiting ? 'flex' : 'none';
    };

    var tick = function() {
      injectStyles();
      ensureOverlay();
      dismissAuthDialogs();
      syncOverlayVisibility();
      bindHangup();
    };

    var start = function() {
      tick();
      var observer = new MutationObserver(tick);
      observer.observe(document.documentElement, { childList: true, subtree: true });
    };

    if (document.body) {
      start();
    } else {
      window.addEventListener('DOMContentLoaded', start);
    }

    window.addEventListener('message', function(event) {
      try {
        var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
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
        // Return to the room-entry screen, not all the way back in the stack.
        setShowMeeting(false);
      }
    } catch {
      // ignore non-JSON messages from the WebView
    }
  };

  // After the hangup button, meet.jit.si redirects to its own thank-you /
  // marketing page (meet.jit.si/static/close*.html) — still on the same
  // domain, so a domain-wide allowlist lets it through. Pin the allowlist
  // to the actual room URL instead; anything else means the user is leaving.
  const roomUrlPrefix = `${SERVER_URL}/${encodeURIComponent(room)}`;
  const isRoomUrl = (url?: string) =>
    !!url && (url.startsWith('about:') || url.startsWith(roomUrlPrefix));

  const handleShouldStartLoad = (request: { url: string }): boolean => {
    if (isRoomUrl(request.url)) return true;
    setShowMeeting(false);
    return false;
  };

  // Safety net: JS-driven redirects on Android sometimes bypass
  // onShouldStartLoadWithRequest. onNavigationStateChange always fires.
  const handleNavStateChange = (state: { url: string }) => {
    if (!isRoomUrl(state.url)) {
      setShowMeeting(false);
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
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onNavigationStateChange={handleNavStateChange}
          injectedJavaScript={INJECTED_JS}
          injectedJavaScriptBeforeContentLoaded={INJECTED_JS}
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
