import React, { useContext, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '@/components';
import { AuthContext } from '@/context/AuthContext';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

const ProfileEditScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const authContext = useContext(AuthContext);

  const { userInfo, updateProfile } = authContext!;

  const [fullName, setFullName] = useState(userInfo?.fullName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(userInfo?.avatarUrl ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      Alert.alert(t('profileEdit.validationTitle'), t('profileEdit.validationNameEmpty'));
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        fullName: trimmedName,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      navigation.goBack();
    } catch {
      Alert.alert(t('profileEdit.errorTitle'), t('profileEdit.errorMessage'));
    } finally {
      setIsSaving(false);
    }
  };

  const avatarSource = avatarUrl.trim()
    ? { uri: avatarUrl.trim() }
    : { uri: userInfo?.avatarUrl ?? 'https://via.placeholder.com/100' };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.text} />
        </Pressable>
        <AppText style={styles.headerTitle}>{t('profileEdit.headerTitle')}</AppText>
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <AppText style={styles.saveBtnText}>{t('profileEdit.saveButton')}</AppText>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar preview */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={avatarSource}
                style={styles.avatar}
                defaultSource={require('../../assets/booking/placeholder.png')}
              />
              <View style={styles.avatarEditBadge}>
                <MaterialCommunityIcons name="camera-outline" size={16} color={COLORS.white} />
              </View>
            </View>
            <AppText style={styles.avatarHint}>{t('profileEdit.avatarHint')}</AppText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <AppText style={styles.label}>{t('profileEdit.fullNameLabel')}</AppText>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={COLORS.inputIcon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t('profileEdit.fullNamePlaceholder')}
                  placeholderTextColor={COLORS.placeholder}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <AppText style={styles.label}>{t('profileEdit.avatarUrlLabel')}</AppText>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons
                  name="image-outline"
                  size={20}
                  color={COLORS.inputIcon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  placeholder={t('profileEdit.avatarUrlPlaceholder')}
                  placeholderTextColor={COLORS.placeholder}
                  autoCapitalize="none"
                  keyboardType="url"
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
              </View>
            </View>

            {/* Read-only info */}
            <View style={styles.readonlySection}>
              <AppText style={styles.readonlySectionTitle}>{t('profileEdit.accountInfoTitle')}</AppText>
              <View style={styles.readonlyRow}>
                <Feather name="mail" size={16} color={COLORS.textTertiary} style={styles.readonlyIcon} />
                <AppText style={styles.readonlyText}>{userInfo?.email ?? '—'}</AppText>
              </View>
              <View style={styles.readonlyRow}>
                <MaterialCommunityIcons name="briefcase-outline" size={16} color={COLORS.textTertiary} style={styles.readonlyIcon} />
                <AppText style={styles.readonlyText}>{userInfo?.role ?? '—'}</AppText>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    backgroundColor: COLORS.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  saveBtn: {
    width: 48,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  saveBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollContent: {
    padding: SPACING.screenHorizontal,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.border,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
  form: {
    gap: SPACING.lg,
  },
  fieldGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    paddingVertical: 0,
  },
  readonlySection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  readonlySectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  readonlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readonlyIcon: {
    marginRight: SPACING.sm,
  },
  readonlyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default ProfileEditScreen;
