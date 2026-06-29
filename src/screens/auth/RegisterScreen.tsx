import { AppText, CustomButton, CustomInput, UserAvatar } from '@/components';
import { PRESET_AVATARS, DEFAULT_AVATAR_KEY, toAvatarValue } from '@/constants';
import { AuthContext } from '@/context/AuthContext';
import { styles } from '@/screens/auth/RegisterScreen.styles';
import { COLORS } from '@/theme';
import { RegisterPayload, UserRole } from '@/types';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RegisterScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  const ROLE_OPTIONS: Array<{ label: string; value: UserRole }> = [
    { label: t('auth.roles.teen'), value: 'TEEN' },
    { label: t('auth.roles.parent'), value: 'PARENT' },
    { label: t('auth.roles.therapist'), value: 'THERAPIST' },
  ];

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerm, setAgreeTerm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('TEEN');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(DEFAULT_AVATAR_KEY);

  const [showPass, setShowPass] = useState(false);

  const [emailError, setEmailError] = useState(false);

  const auth = useContext(AuthContext);

  const handleRegister = async () => {
    setEmailError(false);

    if (!fullName.trim() || !email || !password) {
      Alert.alert(
        t('auth.common.errorTitle'),
        t('auth.register.validationError'),
      );
      return;
    }

    if (!email.includes('@')) {
      setEmailError(true);
      return;
    }

    if (!agreeTerm) {
      Alert.alert(
        t('auth.common.notificationTitle'),
        t('auth.register.mustAgreeTerms'),
      );
      return;
    }

    try {
      const payload: RegisterPayload = {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        avatarUrl: toAvatarValue(selectedAvatar),
      };

      await auth?.register(payload);

      Alert.alert(
        t('auth.register.successTitle'),
        t('auth.register.successNavigateMessage'),
      );
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert(
        t('auth.register.failureTitle'),
        t('auth.register.failureMessage'),
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDeeper} />

      <View style={styles.headerBand}>
        <View style={styles.headerDecorCircle} />
        <AppText style={styles.brandLabel}>uMatter</AppText>
        <AppText style={styles.title}>{t('auth.register.title')}</AppText>
        <AppText style={styles.subtitle}>
          {t('auth.register.subtitle')}
        </AppText>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <CustomInput
              label={t('auth.register.fullNameLabel')}
              iconName="person-outline"
              placeholder={t('auth.register.fullNamePlaceholder')}
              value={fullName}
              onChangeText={setFullName}
            />

            <CustomInput
              label={t('auth.register.emailLabel')}
              iconName="mail-outline"
              placeholder={t('auth.register.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              errorMessage={emailError ? t('auth.register.invalidEmail') : undefined}
            />

            <CustomInput
              label={t('auth.register.passwordLabel')}
              iconName="lock-closed-outline"
              placeholder={t('auth.register.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              isPasswordVisible={showPass}
              onTogglePassword={() => setShowPass(!showPass)}
            />

            {/* Chọn ảnh đại diện mẫu */}
            <AppText style={styles.roleSectionTitle}>
              {t('auth.register.chooseAvatar')}
            </AppText>
            <View style={styles.avatarRow}>
              {PRESET_AVATARS.map(avatar => {
                const isSelected = selectedAvatar === avatar.key;
                return (
                  <TouchableOpacity
                    key={avatar.key}
                    activeOpacity={0.85}
                    onPress={() => setSelectedAvatar(avatar.key)}
                    style={[
                      styles.avatarOption,
                      isSelected && styles.avatarOptionSelected,
                    ]}
                  >
                    <UserAvatar
                      avatarUrl={toAvatarValue(avatar.key)}
                      size={52}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppText style={styles.roleSectionTitle}>
              {t('auth.register.roleSectionTitle')}
            </AppText>
            <View style={styles.roleSelectorContainer}>
              {ROLE_OPTIONS.map(option => {
                const isSelected = selectedRole === option.value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.roleCard,
                      isSelected && styles.roleCardSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedRole(option.value)}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? COLORS.primary : COLORS.textSecondary}
                    />
                    <AppText
                      style={[
                        styles.roleCardText,
                        isSelected && styles.roleCardTextSelected,
                      ]}
                    >
                      {option.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Checkbox Điều khoản */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                onPress={() => setAgreeTerm(!agreeTerm)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={agreeTerm ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={COLORS.text}
                />
              </TouchableOpacity>
              <AppText style={styles.checkboxText}>
                {t('auth.register.agreePrefix')}
                <AppText
                  style={styles.linkText}
                  onPress={() => navigation.navigate('Terms')}
                >
                  {t('auth.register.agreeTermsLink')}
                </AppText>
              </AppText>
            </View>

            {/* Link đã có tài khoản */}
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <AppText style={{ color: COLORS.textSecondary }}>
                {t('auth.register.alreadyHaveAccount')}{' '}
              </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <AppText style={styles.loginLink}>
                  {t('auth.register.loginLink')}
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Component Button */}
            <CustomButton
              title={t('auth.register.submitButton')}
              onPress={handleRegister}
              isLoading={auth?.isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
