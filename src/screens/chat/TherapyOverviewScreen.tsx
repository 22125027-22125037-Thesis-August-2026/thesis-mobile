// src/screens/chat/TherapyOverviewScreen.tsx

import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { aiApi } from '@/api';
import { TherapySessionCard, AppText } from '@/components';
import { EMPTY_CHAT_TEXT } from '@/constants';
import { COLORS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import { ChatSessionOverview } from '@/types';
import { styles } from '@/screens/chat/TherapyOverviewScreen.styles';

type NavigationPropType = NavigationProp<RootStackParamList>;

const TherapyOverviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const [sessions, setSessions] = useState<ChatSessionOverview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await aiApi.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSessions();
    }, [fetchSessions]),
  );

  // Hàm mở phiên Chat mới
  const handleStartNewSession = () => {
    navigation.navigate('Chat', { sessionId: undefined });
  };

  // Hàm mở lại phiên Chat cũ
  const handleResumeSession = (sessionId: string) => {
    navigation.navigate('Chat', { sessionId });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderSessionCard = ({ item }: { item: ChatSessionOverview }) => (
    <TherapySessionCard session={item} onPress={handleResumeSession} />
  );

  // 3. RENDER MÀN HÌNH CHÍNH
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleGoBack}>
            <Feather name="chevron-left" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <AppText style={styles.headerTitle}>Bạn Tâm Giao</AppText>
          <View style={styles.headerSpacer} />
        </View>

        {/* ===== HERO SECTION ===== */}
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            {/* Nếu có file ảnh thật, dùng <Image source={require('...')} /> thay cho Icon này */}
            <MaterialCommunityIcons name="robot-outline" size={80} color={COLORS.primary} style={styles.heroIcon} />
            <AppText style={styles.heroTitle}>Trò chuyện cùng AI</AppText>
            <AppText style={styles.heroSubtitle}>Mình luôn ở đây để lắng nghe bạn</AppText>
            
            <Pressable style={styles.primaryBtn} onPress={handleStartNewSession}>
              <AppText style={styles.primaryBtnText}>Bắt đầu tâm sự</AppText>
            </Pressable>
          </View>
        </View>

        {/* ===== LỊCH SỬ TRÒ CHUYỆN ===== */}
        <View style={styles.historySection}>
          <AppText style={styles.sectionTitle}>Lịch sử trò chuyện</AppText>
          {isLoading ? (
            <View style={styles.centerStateContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.centerStateContainer}>
              <AppText style={styles.emptyStateText}>{EMPTY_CHAT_TEXT}</AppText>
            </View>
          ) : (
            <FlatList
              data={sessions}
              keyExtractor={(item) => item.sessionId}
              renderItem={renderSessionCard}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

      </View>
    </SafeAreaView>
  );
};

export default TherapyOverviewScreen;
