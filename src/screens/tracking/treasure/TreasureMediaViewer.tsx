import React from 'react';
import { Image, Modal, Pressable, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { AppText } from '@/components';
import { COLORS } from '@/theme';
import type { TreasureMediaType } from '@/types';
import { styles } from './TreasureBoxScreen.styles';

// react-native-video needs a native rebuild to be linked. We require it lazily
// (mirroring BreathingAudio / haptics) so the screen degrades gracefully — image
// treasures still open, and audio/video show a friendly hint — if it isn't yet
// available, instead of crashing.
let VideoComponent: React.ComponentType<any> | null = null;
try {
  const mod = require('react-native-video');
  VideoComponent = (mod?.default ?? mod) as React.ComponentType<any>;
} catch {
  VideoComponent = null;
}

interface TreasureMediaViewerProps {
  url: string | null;
  type: TreasureMediaType | null;
  /** Emoji shown as the centrepiece for audio-only treasures. */
  emoji?: string;
  onClose: () => void;
}

/** Full-screen viewer for a treasure's image / video / voice note. */
const TreasureMediaViewer: React.FC<TreasureMediaViewerProps> = ({
  url,
  type,
  emoji,
  onClose,
}) => {
  const visible = url !== null && type !== null;
  const Video = VideoComponent;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.mediaViewerBackdrop}>
        <Pressable style={styles.mediaViewerClose} onPress={onClose} hitSlop={10}>
          <Feather name="x" size={26} color={COLORS.white} />
        </Pressable>

        {visible && type === 'IMAGE' && (
          <Image
            source={{ uri: url ?? undefined }}
            style={styles.mediaViewerImage}
            resizeMode="contain"
          />
        )}

        {visible && (type === 'VIDEO' || type === 'AUDIO') &&
          (Video ? (
            <View style={styles.mediaViewerPlayerWrap}>
              {type === 'AUDIO' && (
                <AppText style={styles.mediaViewerAudioEmoji}>
                  {emoji && emoji.length > 0 ? emoji : '🎵'}
                </AppText>
              )}
              <Video
                source={{ uri: url ?? undefined }}
                controls
                paused={false}
                resizeMode="contain"
                audioOnly={type === 'AUDIO'}
                ignoreSilentSwitch="ignore"
                style={
                  type === 'AUDIO'
                    ? styles.mediaViewerAudio
                    : styles.mediaViewerVideo
                }
              />
            </View>
          ) : (
            <View style={styles.mediaViewerFallback}>
              <Feather name="alert-circle" size={28} color={COLORS.white} />
              <AppText style={styles.mediaViewerFallbackText}>
                Cần cài đặt lại ứng dụng để phát nội dung này.
              </AppText>
            </View>
          ))}
      </View>
    </Modal>
  );
};

export default TreasureMediaViewer;
