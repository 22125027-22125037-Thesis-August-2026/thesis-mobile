import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { dataAccessGrantApi } from '@/api';
import type { GrantStatusResponse } from '@/api/dataAccessGrantApi';
import { AppText } from '@/components';
import { DailyLogsSection } from '@/components/tracking';
import { RootStackParamList } from '@/navigation';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

type FriendProfileRoute = RouteProp<RootStackParamList, 'FriendProfile'>;
type RootNavigation = NavigationProp<RootStackParamList>;

const GRANT_SCOPE = 'READ_ALL' as const;
const GRANT_DURATION_DAYS = 30;

const FriendProfileScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<FriendProfileRoute>();

  const { friendProfileId, friendName } = route.params;

  const [grantStatus, setGrantStatus] = useState<GrantStatusResponse | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [isConfirmGrantVisible, setIsConfirmGrantVisible] = useState(false);
  const [isGranting, setIsGranting] = useState(false);
  const [isUnfriendModalVisible, setIsUnfriendModalVisible] = useState(false);

  const loadGrantStatus = useCallback(async () => {
    setIsStatusLoading(true);
    try {
      const status = await dataAccessGrantApi.getGrantStatus(friendProfileId);
      setGrantStatus(status);
    } catch (err) {
      console.error('[FriendProfileScreen] getGrantStatus failed:', err);
    } finally {
      setIsStatusLoading(false);
    }
  }, [friendProfileId]);

  useEffect(() => {
    void loadGrantStatus();
  }, [loadGrantStatus]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleConfirmGrant = useCallback(async () => {
    setIsGranting(true);
    try {
      const expiresAt = new Date(
        Date.now() + GRANT_DURATION_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();
      await dataAccessGrantApi.grantAccess(friendProfileId, GRANT_SCOPE, expiresAt);
      setIsConfirmGrantVisible(false);
      await loadGrantStatus();
    } catch (err) {
      console.error('[FriendProfileScreen] grantAccess failed:', err);
      Alert.alert('Lỗi', 'Không thể chia sẻ quyền truy cập. Vui lòng thử lại.');
    } finally {
      setIsGranting(false);
    }
  }, [friendProfileId, loadGrantStatus]);

  const handleRevokePermission = useCallback(async () => {
    try {
      await dataAccessGrantApi.revokeAccess(friendProfileId);
      Alert.alert('Đã thu hồi', `Quyền truy cập của ${friendName} đã bị thu hồi.`);
      await loadGrantStatus();
    } catch (err) {
      console.error('[FriendProfileScreen] revokeAccess failed:', err);
      Alert.alert('Lỗi', 'Không thể thu hồi quyền truy cập. Vui lòng thử lại.');
    }
  }, [friendProfileId, friendName, loadGrantStatus]);

  const handleConfirmUnfriend = useCallback(() => {
    setIsUnfriendModalVisible(false);
    Alert.alert('Thông báo', 'Tính năng đang được phát triển.');
  }, []);

  const iGaveAccess = grantStatus?.iGaveThemAccess ?? false;
  const theyGaveAccess = grantStatus?.theyGaveMeAccess ?? false;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <AppText style={styles.headerTitle}>{friendName}</AppText>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {isStatusLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>

          {/* Section 1: Privacy & Permissions */}
          <AppText style={styles.sectionLabel}>Quyền riêng tư của bạn</AppText>
          <View style={styles.card}>
            {iGaveAccess ? (
              <Pressable style={styles.row} onPress={handleRevokePermission}>
                <MaterialCommunityIcons
                  name="shield-off-outline"
                  size={22}
                  color={COLORS.accentNegative}
                />
                <View style={styles.rowTextWrap}>
                  <AppText style={[styles.rowTitle, styles.rowTitleDestructive]}>
                    Thu hồi quyền truy cập dữ liệu theo dõi
                  </AppText>
                  <AppText style={styles.rowSubtitle}>
                    Bạn đang chia sẻ dữ liệu sức khỏe với {friendName}
                  </AppText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textSecondary} />
              </Pressable>
            ) : (
              <Pressable style={styles.row} onPress={() => setIsConfirmGrantVisible(true)}>
                <MaterialCommunityIcons
                  name="shield-plus-outline"
                  size={22}
                  color={COLORS.primary}
                />
                <View style={styles.rowTextWrap}>
                  <AppText style={styles.rowTitle}>
                    Chia sẻ dữ liệu theo dõi với {friendName}
                  </AppText>
                  <AppText style={styles.rowSubtitle}>Bạn chưa chia sẻ dữ liệu sức khỏe</AppText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* Section 2: Friend's Holistic Tracking */}
          <AppText style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
            Dữ liệu theo dõi của {friendName}
          </AppText>
          {theyGaveAccess ? (
            <DailyLogsSection targetProfileId={friendProfileId} isOwnProfile={false} />
          ) : (
            <View style={styles.lockedCard}>
              <MaterialCommunityIcons name="lock-outline" size={32} color={COLORS.textSecondary} />
              <AppText style={styles.lockedTitle}>Chưa được cấp quyền</AppText>
              <AppText style={styles.lockedBody}>
                {friendName} chưa chia sẻ dữ liệu theo dõi sức khỏe với bạn.
              </AppText>
            </View>
          )}

          {/* Section 3: Danger Zone */}
          <View style={styles.dangerZone}>
            <Pressable style={styles.unfriendRow} onPress={() => setIsUnfriendModalVisible(true)}>
              <MaterialCommunityIcons name="account-remove-outline" size={22} color={COLORS.accentNegative} />
              <AppText style={styles.unfriendText}>Hủy kết bạn</AppText>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* Grant permission confirmation bottom sheet */}
      <Modal
        visible={isConfirmGrantVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsConfirmGrantVisible(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetCard}>
            <View style={styles.sheetIconWrap}>
              <MaterialCommunityIcons name="share-variant" size={32} color={COLORS.accentPositive} />
            </View>
            <AppText style={styles.sheetTitle}>Chia sẻ dữ liệu theo dõi?</AppText>
            <AppText style={styles.sheetBody}>
              Bạn có chắc chắn muốn chia sẻ dữ liệu Holistic Tracking (bao gồm nhật ký cá nhân, chỉ số
              dinh dưỡng và dữ liệu giấc ngủ) với{' '}
              <AppText style={styles.sheetNameHighlight}>{friendName}</AppText> không?
            </AppText>
            <View style={styles.bulletList}>
              <AppText style={styles.bulletText}>
                • Lưu ý: Việc chia sẻ này giúp đối phương theo dõi sát sao lộ trình sức khỏe của bạn.
              </AppText>
              <AppText style={styles.bulletText}>
                • Quyền riêng tư: bạn có toàn quyền thu hồi quyền truy cập.
              </AppText>
            </View>
            <View style={styles.sheetButtons}>
              <Pressable
                style={[styles.sheetBtn, styles.sheetBtnCancel]}
                onPress={() => setIsConfirmGrantVisible(false)}
                disabled={isGranting}>
                <AppText style={styles.sheetBtnCancelText}>Hủy</AppText>
              </Pressable>
              <Pressable
                style={[styles.sheetBtn, styles.sheetBtnConfirm]}
                onPress={handleConfirmGrant}
                disabled={isGranting}>
                {isGranting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <AppText style={styles.sheetBtnConfirmText}>Xác nhận</AppText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Unfriend confirmation modal */}
      <Modal
        visible={isUnfriendModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsUnfriendModalVisible(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.centeredCard}>
            <MaterialCommunityIcons name="account-remove" size={40} color={COLORS.accentNegative} />
            <AppText style={styles.sheetTitle}>Hủy kết bạn?</AppText>
            <AppText style={styles.sheetBody}>
              Bạn có chắc muốn hủy kết bạn với{' '}
              <AppText style={styles.sheetNameHighlight}>{friendName}</AppText>?
            </AppText>
            <View style={styles.sheetButtons}>
              <Pressable
                style={[styles.sheetBtn, styles.sheetBtnCancel]}
                onPress={() => setIsUnfriendModalVisible(false)}>
                <AppText style={styles.sheetBtnCancelText}>Hủy</AppText>
              </Pressable>
              <Pressable
                style={[styles.sheetBtn, styles.sheetBtnDestructive]}
                onPress={handleConfirmUnfriend}>
                <AppText style={styles.sheetBtnConfirmText}>Xác nhận</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerPlaceholder: {
    width: 36,
    height: 36,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionLabelSpaced: {
    marginTop: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  rowTitleDestructive: {
    color: COLORS.accentNegative,
  },
  rowSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lockedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    opacity: 0.7,
  },
  lockedTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  lockedBody: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  dangerZone: {
    marginTop: SPACING.xxl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.borderSubtle,
    paddingTop: SPACING.lg,
  },
  unfriendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  unfriendText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.accentNegative,
  },
  // Bottom sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.card * 2,
    borderTopRightRadius: BORDER_RADIUS.card * 2,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  sheetIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.therapyHeroBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sheetBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  sheetNameHighlight: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bulletList: {
    width: '100%',
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  bulletText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  sheetBtn: {
    flex: 1,
    height: 48,
    borderRadius: BORDER_RADIUS.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetBtnCancel: {
    backgroundColor: COLORS.inputBackground,
  },
  sheetBtnCancelText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sheetBtnConfirm: {
    backgroundColor: COLORS.accentPositive,
  },
  sheetBtnDestructive: {
    backgroundColor: COLORS.accentNegative,
  },
  sheetBtnConfirmText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Centered modal (unfriend)
  centerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
  },
  centeredCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card * 2,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    gap: SPACING.sm,
  },
});

export default FriendProfileScreen;
