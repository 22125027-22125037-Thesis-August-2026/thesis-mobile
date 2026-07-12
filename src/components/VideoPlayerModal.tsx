import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components';
import { COLORS, FONT_SIZES, SPACING } from '@/theme';

/** Trích YouTube video id từ nhiều dạng URL (watch?v=, youtu.be/, /embed/). */
export const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
};

interface VideoPlayerModalProps {
  visible: boolean;
  youtubeUrl: string | null;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  youtubeUrl,
  onClose,
}) => {
  const videoId = youtubeUrl ? extractYoutubeId(youtubeUrl) : null;
  const [playing, setPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset trạng thái mỗi lần mở/đổi video.
  useEffect(() => {
    setHasError(false);
    setPlaying(visible && !!videoId);
  }, [visible, videoId]);

  const frameWidth = Dimensions.get('window').width - SPACING.md * 2;
  const frameHeight = Math.round((frameWidth * 9) / 16);

  const openExternally = () => {
    if (youtubeUrl) {
      Linking.openURL(youtubeUrl).catch(() => undefined);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.playerWrap}>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <MaterialCommunityIcons name="close" size={22} color={COLORS.white} />
          </Pressable>
          <View style={[styles.videoFrame, { height: frameHeight }]}>
            {videoId && !hasError ? (
              <YoutubePlayer
                height={frameHeight}
                width={frameWidth}
                play={playing}
                videoId={videoId}
                onError={() => setHasError(true)}
                onChangeState={(state: string) => {
                  if (state === 'ended') setPlaying(false);
                }}
                initialPlayerParams={{
                  modestbranding: true,
                  rel: false,
                }}
                webViewProps={{
                  allowsInlineMediaPlayback: true,
                  mediaPlaybackRequiresUserAction: false,
                }}
              />
            ) : (
              <Pressable style={styles.errorState} onPress={openExternally}>
                <MaterialCommunityIcons name="youtube" size={40} color={COLORS.white} />
                <AppText style={styles.errorText}>
                  Không phát được video ở đây. Chạm để mở trên YouTube.
                </AppText>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlayDarkMedium,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  playerWrap: {
    width: '100%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.overlayDarkMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  videoFrame: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  errorText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default VideoPlayerModal;
