// src/screens/chat/TherapyOverviewScreen.tsx

import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { aiApi } from '@/api';
import { TherapySessionCard, AppText } from '@/components';
import { COLORS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import { ChatSessionOverview } from '@/types';
import { styles } from '@/screens/chat/TherapyOverviewScreen.styles';

type NavigationPropType = NavigationProp<RootStackParamList>;

const TherapyOverviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<ChatSessionOverview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchSessions = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const data = await aiApi.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSessions();
    }, [fetchSessions]),
  );

  const handleStartNewSession = () => {
    navigation.navigate('Chat', { sessionId: undefined });
  };

  const handleResumeSession = (sessionId: string) => {
    navigation.navigate('Chat', { sessionId });
  };

  const renderSessionCard = ({ item }: { item: ChatSessionOverview }) => (
    <TherapySessionCard session={item} onPress={handleResumeSession} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="robot-happy-outline"
        size={56}
        color={COLORS.primaryLight}
      />
      <AppText style={styles.emptyText}>{t('chat.overview.emptyText')}</AppText>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>

        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <AppText style={styles.headerTitle}>{t('chat.overview.headerTitle')}</AppText>
            <AppText style={styles.headerSubtitle}>{t('chat.overview.headerSubtitle')}</AppText>
          </View>
        </View>

        {/* ===== SCROLLABLE BODY ===== */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchSessions(true)}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }>

          {/* ===== HERO CARD ===== */}
          <View style={styles.heroWrapper}>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.aiAvatar}>
                  <MaterialCommunityIcons
                    name="robot-happy-outline"
                    size={28}
                    color={COLORS.white}
                  />
                </View>
                <View style={styles.heroTextContainer}>
                  <AppText style={styles.heroTitle}>{t('chat.overview.heroTitle')}</AppText>
                  <AppText style={styles.heroSubtitle}>{t('chat.overview.heroSubtitle')}</AppText>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.heroCTAPill, pressed && { opacity: 0.8 }]}
                onPress={handleStartNewSession}>
                <AppText style={styles.heroCTAText}>{t('chat.overview.heroCTA')}</AppText>
                <View style={styles.heroCTAButton}>
                  <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />
                </View>
              </Pressable>
            </View>
          </View>

          {/* ===== LỊCH SỬ TRÒ CHUYỆN ===== */}
          <View style={styles.historySection}>
            <AppText style={styles.sectionTitle}>{t('chat.overview.historyTitle')}</AppText>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : sessions.length === 0 ? (
              renderEmpty()
            ) : (
              <FlatList
                data={sessions}
                keyExtractor={(item) => item.sessionId}
                renderItem={renderSessionCard}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default TherapyOverviewScreen;
