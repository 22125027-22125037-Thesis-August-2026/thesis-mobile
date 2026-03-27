// src/screens/TherapyOverviewScreen.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image, // Import Image nếu bạn có ảnh thật
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, SPACING } from '../constants/theme';
import { TrackingStackParamList } from '../navigation/types';

type NavigationPropType = NavigationProp<TrackingStackParamList>;

// 1. DỮ LIỆU GIẢ (MOCK DATA)
// Sau này sẽ thay bằng API: GET /api/v1/ai/chat/history
const MOCK_SESSIONS = [
  { id: 'sess-1', date: 'Hôm nay, 10:30', preview: 'Mình cảm thấy áp lực chuyện học hành quá...', emotion: 'SAD', color: '#FB923C' },
  { id: 'sess-2', date: 'Hôm qua, 21:00', preview: 'Hôm nay mình đã làm bài thi rất tốt!', emotion: 'HAPPY', color: '#84CC16' },
  { id: 'sess-3', date: '15/03/2026', preview: 'Mình không biết phải nói chuyện với bạn bè sao nữa.', emotion: 'ANXIOUS', color: '#A855F7' },
];

const TherapyOverviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  // Hàm mở phiên Chat mới
  const handleStartNewSession = () => {
    // Truyền sessionId là null để Backend tự tạo phiên mới
    navigation.navigate('Chat', { sessionId: undefined }); 
  };

  // Hàm mở lại phiên Chat cũ
  const handleResumeSession = (sessionId: string) => {
    navigation.navigate('Chat', { sessionId: sessionId });
  };

const handleGoBack = () => {
    navigation.navigate('Home'); 
  };

  // 2. RENDER TỪNG THẺ LỊCH SỬ
  const renderSessionCard = ({ item }: { item: typeof MOCK_SESSIONS[0] }) => {
    return (
      <Pressable 
        style={styles.cardContainer} 
        onPress={() => handleResumeSession(item.id)}
      >
        {/* Vạch màu cảm xúc bên trái */}
        <View style={[styles.colorBar, { backgroundColor: item.color }]} />
        
        {/* Nội dung chính */}
        <View style={styles.cardContent}>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={styles.previewText} numberOfLines={1}>
            {item.preview}
          </Text>
        </View>

        {/* Nút ba chấm (Tương lai để xóa) */}
        <Pressable style={styles.moreButton} onPress={() => console.log('Open Menu', item.id)}>
          <MaterialCommunityIcons name="dots-vertical" size={20} color={COLORS.textSecondary} />
        </Pressable>
      </Pressable>
    );
  };

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
          <View style={{ width: 40 }} /> {/* Spacer để cân bằng Title */}
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
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={renderSessionCard}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>

      </View>
    </SafeAreaView>
  );
};

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFBF7', // Màu nền theo thiết kế
  },
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  
  // Hero Section
  heroSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  heroCard: {
    backgroundColor: '#F0F4E8', // Màu nền thẻ hero
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  primaryBtn: {
    backgroundColor: '#372A21', // Nút màu nâu đậm
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // History Section
  historySection: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  listContainer: {
    paddingBottom: SPACING.xl,
  },
  
  // Session Card
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  colorBar: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  moreButton: {
    padding: 16,
  },
});

export default TherapyOverviewScreen;