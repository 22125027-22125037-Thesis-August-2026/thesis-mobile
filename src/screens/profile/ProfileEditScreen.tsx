import React, { useContext, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { AppText } from '@/components';
import { AuthContext } from '@/context/AuthContext';
import { uploadAvatarImage } from '@/api';
import { playSoftHaptic } from '@/utils';
import { COLORS } from '@/theme';
import { styles } from './ProfileEditScreen.styles';

const PLACEHOLDER = require('../../assets/booking/placeholder.png');

const ProfileEditScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const authContext = useContext(AuthContext);
  const { userInfo, updateProfile } = authContext!;

  const [fullName, setFullName] = useState(userInfo?.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(userInfo?.phoneNumber ?? '');
  const [avatarUrl, setAvatarUrl] = useState(userInfo?.avatarUrl ?? '');
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isDangerOpen, setIsDangerOpen] = useState(false);

  const isSaveDisabled = fullName.trim() === '' || isSaving || isUploadingAvatar;

  const avatarSource = localAvatarUri
    ? { uri: localAvatarUri }
    : avatarUrl
    ? { uri: avatarUrl }
    : PLACEHOLDER;

  const handlePickAvatar = () => {
    Alert.alert(
      t('profileEdit.avatarPickerTitle'),
      undefined,
      [
        {
          text: t('profileEdit.avatarPickerLibrary'),
          onPress: openImageLibrary,
        },
        {
          text: t('profileEdit.avatarPickerCancel'),
          style: 'cancel',
        },
      ],
    );
  };

  const openImageLibrary = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets?.length) {
      return;
    }

    const uri = result.assets[0].uri;
    if (!uri) {
      return;
    }

    setLocalAvatarUri(uri);
    setIsUploadingAvatar(true);
    try {
      const uploadedUrl = await uploadAvatarImage(uri);
      setAvatarUrl(uploadedUrl);
    } catch {
      Alert.alert(t('profileEdit.errorTitle'), t('profileEdit.avatarUploadError'));
      setLocalAvatarUri(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert(t('profileEdit.validationTitle'), t('profileEdit.validationNameEmpty'));
      return;
    }
    playSoftHaptic();
    setIsSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      Alert.alert('', t('profileEdit.toastSuccess'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert(t('profileEdit.errorTitle'), t('profileEdit.errorMessage'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profileEdit.deleteAccountConfirmTitle'),
      t('profileEdit.deleteAccountConfirmMessage'),
      [
        { text: t('profileEdit.deleteAccountCancel'), style: 'cancel' },
        {
          text: t('profileEdit.deleteAccountConfirm'),
          style: 'destructive',
          onPress: () => { /* TODO: deleteAccount API */ },
        },
      ],
    );
  };

  const profileId = userInfo?.profileId ?? '—';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.text} />
        </Pressable>
        <AppText style={styles.headerTitle}>{t('profileEdit.headerTitle')}</AppText>
        <Pressable
          style={[styles.saveBtn, isSaveDisabled && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaveDisabled}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
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
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ===== AVATAR BANNER ===== */}
          <View style={styles.avatarBanner}>
            <Pressable
              style={({ pressed }) => [styles.avatarTouchable, pressed && { opacity: 0.85 }]}
              onPress={handlePickAvatar}
              disabled={isUploadingAvatar}
            >
              <Image
                source={avatarSource}
                style={styles.avatar}
                defaultSource={PLACEHOLDER}
              />
              <View style={styles.editBadge}>
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <MaterialCommunityIcons name="camera-outline" size={16} color={COLORS.white} />
                )}
              </View>
            </Pressable>
            <AppText style={styles.avatarHint}>{t('profileEdit.avatarHint')}</AppText>
          </View>

          {/* ===== FORM ===== */}
          <View style={styles.form}>

            {/* Họ và tên */}
            <View style={styles.fieldGroup}>
              <AppText style={styles.fieldLabel}>{t('profileEdit.fullNameLabel')}</AppText>
              <View style={[styles.inputRow, isNameFocused && styles.inputRowFocused]}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={COLORS.inputIcon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t('profileEdit.fullNamePlaceholder')}
                  placeholderTextColor={COLORS.placeholder}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                />
              </View>
            </View>

            {/* Số điện thoại */}
            <View style={styles.fieldGroup}>
              <AppText style={styles.fieldLabel}>{t('profileEdit.phoneLabel')}</AppText>
              <View style={[styles.inputRow, isPhoneFocused && styles.inputRowFocused]}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={20}
                  color={COLORS.inputIcon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="0xxxxxxxxx"
                  placeholderTextColor={COLORS.placeholder}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onFocus={() => setIsPhoneFocused(true)}
                  onBlur={() => setIsPhoneFocused(false)}
                />
              </View>
            </View>

            {/* Ngày sinh — read-only */}
            <View style={styles.fieldGroup}>
              <AppText style={styles.fieldLabel}>{t('profileEdit.dobLabel')}</AppText>
              <View style={[styles.inputRow, styles.inputRowReadonly]}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={20}
                  color={COLORS.inputIconMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={userInfo?.dob ?? ''}
                  placeholder="—"
                  placeholderTextColor={COLORS.placeholder}
                  editable={false}
                />
              </View>
            </View>

            {/* Read-only info card */}
            <View style={styles.readonlyCard}>
              <AppText style={styles.readonlyCardTitle}>{t('profileEdit.accountInfoTitle')}</AppText>
              <View style={styles.readonlyRow}>
                <MaterialCommunityIcons name="email-outline" size={16} color={COLORS.textTertiary} />
                <AppText style={styles.readonlyLabel}>Email</AppText>
                <AppText style={styles.readonlyValue} numberOfLines={1}>{userInfo?.email ?? '—'}</AppText>
              </View>
              <View style={styles.readonlyRow}>
                <MaterialCommunityIcons name="briefcase-outline" size={16} color={COLORS.textTertiary} />
                <AppText style={styles.readonlyLabel}>Vai trò</AppText>
                <AppText style={styles.readonlyValue}>{userInfo?.role ?? '—'}</AppText>
              </View>
              <View style={styles.readonlyRow}>
                <MaterialCommunityIcons name="identifier" size={16} color={COLORS.textTertiary} />
                <AppText style={styles.readonlyLabel}>Profile ID</AppText>
                <AppText style={styles.readonlyValue} selectable>{profileId}</AppText>
              </View>
            </View>

            {/* Danger zone */}
            <View>
              <Pressable
                style={({ pressed }) => [
                  styles.dangerZoneHeader,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setIsDangerOpen(v => !v)}
              >
                <AppText style={styles.dangerZoneTitle}>{t('profileEdit.dangerZoneTitle')}</AppText>
                <MaterialCommunityIcons
                  name={isDangerOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={COLORS.accentNegative}
                />
              </Pressable>

              {isDangerOpen && (
                <View style={styles.dangerCard}>
                  <Pressable
                    style={({ pressed }) => [styles.dangerRow, pressed && { opacity: 0.7 }]}
                    onPress={handleDeleteAccount}
                  >
                    <Feather name="trash-2" size={18} color={COLORS.accentNegative} />
                    <AppText style={styles.dangerRowText}>{t('profileEdit.deleteAccount')}</AppText>
                  </Pressable>
                </View>
              )}
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileEditScreen;
