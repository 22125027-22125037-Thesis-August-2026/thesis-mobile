import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '@/components';
import { COLORS, FONT_SIZES, SPACING } from '@/theme';

const FAQS = [
  {
    q: 'Nhật ký của tôi có ai đọc được không?',
    a: 'Mặc định chỉ riêng bạn xem được. Bạn có thể chia sẻ một bài viết cụ thể cho người thân hoặc chuyên gia khi cần.',
  },
  {
    q: 'Làm sao để đặt lịch với chuyên gia?',
    a: 'Vào tab Đặt lịch → chọn "Tìm chuyên gia phù hợp" hoặc xem danh sách trực tiếp và chọn khung giờ trống.',
  },
  {
    q: 'Tôi có thể huỷ lịch hẹn không?',
    a: 'Bạn được huỷ hoặc dời lịch miễn phí trước 24 giờ so với giờ hẹn.',
  },
  {
    q: 'Dữ liệu của tôi được lưu ở đâu?',
    a: 'Dữ liệu được mã hoá và lưu trên máy chủ tại Việt Nam. uMatter không bán hay chia sẻ dữ liệu cho bên thứ ba.',
  },
  {
    q: 'Tôi có thể xoá tài khoản không?',
    a: 'Vào Hồ sơ → Chỉnh sửa hồ sơ → Vùng nguy hiểm → Xoá tài khoản.',
  },
];

const FAQScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Hero Header */}
      <View style={styles.header}>
        <View style={styles.circleLg} />
        <View style={styles.circleSm} />
        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.white} />
          </Pressable>
          <View style={styles.headerText}>
            <AppText style={styles.eyebrow}>Trung tâm hỗ trợ</AppText>
            <AppText style={styles.title}>Câu hỏi thường gặp</AppText>
          </View>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="lifebuoy" size={24} color={COLORS.white} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {FAQS.map((item, idx) => (
          <View key={idx}>
            <View style={styles.faqItem}>
              <AppText style={styles.question}>{item.q}</AppText>
              <AppText style={styles.answer}>{item.a}</AppText>
            </View>
            {idx < FAQS.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  circleLg: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.whiteAlpha08,
  },
  circleSm: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.whiteAlpha06,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    zIndex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.whiteAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.whiteAlpha85,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 2,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.whiteAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  // Content
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  faqItem: {
    paddingVertical: SPACING.md,
  },
  question: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  answer: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
  },
});

export default FAQScreen;
