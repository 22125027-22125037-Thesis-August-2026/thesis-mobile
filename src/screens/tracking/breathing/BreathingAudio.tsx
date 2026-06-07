import React from 'react';
import { StyleSheet } from 'react-native';

interface BreathingAudioProps {
  /** Whether the track should be playing. */
  playing: boolean;
}

// Optional native module. The project may not have `react-native-video` linked
// yet (it needs a native rebuild / `pod install`). We require it lazily so the
// breathing screen still works silently before the rebuild — mirroring the
// defensive pattern in `src/utils/haptics.ts`.
let VideoComponent: React.ComponentType<any> | null = null;
try {
  const mod = require('react-native-video');
  VideoComponent = (mod?.default ?? mod) as React.ComponentType<any>;
} catch {
  VideoComponent = null;
}

// The bundled track is added by the developer (see src/assets/audio/README.md).
// Wrapped in its own try/catch so a missing file doesn't crash the screen.
let trackSource: number | null = null;
try {
  trackSource = require('@/assets/audio/breathing_calm.mp3');
} catch {
  trackSource = null;
}

const BreathingAudio: React.FC<BreathingAudioProps> = ({ playing }) => {
  if (!VideoComponent || !trackSource) {
    return null;
  }

  const Video = VideoComponent;
  return (
    <Video
      source={trackSource}
      paused={!playing}
      repeat
      audioOnly
      playInBackground={false}
      ignoreSilentSwitch="ignore"
      volume={0.6}
      style={styles.hidden}
    />
  );
};

const styles = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
  },
});

export default BreathingAudio;
