// src/screens/chat/TherapyOverviewScreen.tsx

import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { EMPTY_CHAT_TEXT } from '../../constants/chat';
import { TrackingStackParamList } from '../../navigation/types';
import { aiApi } from '../../api/aiApi';
import { ChatSessionOverview } from '../../types/chat';
import TherapySessionCard from '../../components/TherapySessionCard';
import { styles } from './TherapyOverviewScreen.styles';

type NavigationPropType = NavigationProp<TrackingStackParamList>;

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
    navigation.navigate('Home');
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
          <Text style={styles.headerTitle}>Bạn Tâm Giao</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* ===== HERO SECTION ===== */}
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            {/* Nếu có file ảnh thật, dùng <Image source={require('...')} /> thay cho Icon này */}
            <MaterialCommunityIcons name="robot-outline" size={80} color={COLORS.primary} style={styles.heroIcon} />
            <Text style={styles.heroTitle}>Trò chuyện cùng AI</Text>
            <Text style={styles.heroSubtitle}>Mình luôn ở đây để lắng nghe bạn</Text>
            
            <Pressable style={styles.primaryBtn} onPress={handleStartNewSession}>
              <Text style={styles.primaryBtnText}>Bắt đầu tâm sự</Text>
            </Pressable>
          </View>
        </View>

        {/* ===== LỊCH SỬ TRÒ CHUYỆN ===== */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Lịch sử trò chuyện</Text>
          {isLoading ? (
            <View style={styles.centerStateContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.centerStateContainer}>
              <Text style={styles.emptyStateText}>{EMPTY_CHAT_TEXT}</Text>
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
