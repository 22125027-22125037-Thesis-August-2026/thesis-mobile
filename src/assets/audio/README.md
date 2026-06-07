# Breathing exercise audio

The guided breathing screen (`BreathingExerciseScreen`) loops a calming
background track via `react-native-video` (audio-only).

## Current file

`breathing_calm.mp3` is **"Meditation Impromptu 01" by Kevin MacLeod**
(incompetech.com).

- License: **Creative Commons Attribution 3.0 (CC-BY 3.0)** —
  https://creativecommons.org/licenses/by/3.0/
- ⚠️ **Attribution is required before release.** Add a credit somewhere visible
  (e.g. an app "Credits"/"About" screen), for example:
  > "Meditation Impromptu 01" by Kevin MacLeod (incompetech.com),
  > licensed under CC BY 3.0.
- It plays on `repeat` at low volume during the breathing session.
- `.mp3` is part of Metro's default `assetExts`, so no Metro config change is
  needed — just rebuild the native app so the asset is bundled.

To swap it for a CC0 track (no attribution needed), replace the file in place
keeping the same name `breathing_calm.mp3`.

Until the file exists, the screen runs silently: the audio component fails to
load gracefully and the breathing/haptic guide still works.

## Native setup reminder

`react-native-video` is a native module. After `npm install`, run:

```
cd ios && pod install   # iOS
```

and rebuild the Android/iOS app (Metro reload alone is not enough).
