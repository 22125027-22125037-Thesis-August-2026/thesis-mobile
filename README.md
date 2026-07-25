# uMatter

uMatter is a mental wellness companion mobile app built with React Native.
It helps users track mood and habits, practice guided breathing and
meditation exercises, chat in real time with a therapist, and receive
supportive push notifications, with full Vietnamese and English support.

This repository contains the mobile client only (Android). The backend
services (authentication, tracking, social, notification, therapist) run
separately and are consumed over HTTP/WebSocket.

## Tech stack

- React Native 0.83.1 (bare CLI, New Architecture enabled) + React 19.2.0
- TypeScript
- React Navigation (native-stack, bottom-tabs)
- Firebase Cloud Messaging + Notifee for notifications
- STOMP over WebSocket for real-time chat
- i18next for localization (VI/EN)

## Getting started

This project ships without `node_modules` and without prebuilt binaries.
Follow these two guides in order:

1. [HuongDanCaiDat.txt](HuongDanCaiDat.txt): required tools, development
   environment, and how to install project dependencies.
2. [HuongDanSuDung.txt](HuongDanSuDung.txt): how to compile and run the
   application.

## Project structure

- `src/` — application source (screens, components, API clients, theming,
  localization)
- `android/` — native Android project
- `ios/` — native iOS project skeleton (not configured, Android only for
  now)
- `scripts/` — small utility scripts (e.g. icon generation)
