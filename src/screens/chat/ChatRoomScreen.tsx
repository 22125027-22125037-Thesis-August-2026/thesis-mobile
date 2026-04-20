import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components';
import { COLORS, SPACING } from '@/theme';

const ChatRoomScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppText style={styles.text}>
          Tính năng Chat Room đang được phát triển
        </AppText>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
  },
  text: {
    fontSize: 18,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});

export default ChatRoomScreen;
