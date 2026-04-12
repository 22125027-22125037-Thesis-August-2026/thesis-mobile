import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

// Import
import { AuthContext } from '@/context/AuthContext';
import { COLORS } from '@/theme';
import { CustomButton, CustomInput } from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '@/screens/auth/RegisterScreen.styles';
import { RegisterPayload, UserRole } from '@/types';

const RegisterScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  const ROLE_OPTIONS: Array<{ label: string; value: UserRole }> = [
    { label: t('auth.roles.teen'), value: 'TEEN' },
    { label: t('auth.roles.parent'), value: 'PARENT' },
    { label: t('auth.roles.therapist'), value: 'THERAPIST' },
  ];

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerm, setAgreeTerm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('TEEN');
  const [school, setSchool] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [linkedTeenId, setLinkedTeenId] = useState('');
  
  // State hiển thị mật khẩu
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // State lỗi (demo giống hình)
  const [emailError, setEmailError] = useState(false);

  const auth = useContext(AuthContext);

  const getRoleSpecificPayload = (): Partial<RegisterPayload> => {
    if (selectedRole === 'TEEN') {
      return {
        school: school.trim() || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
      };
    }

    if (selectedRole === 'THERAPIST') {
      const normalizedYears = yearsOfExperience.trim();
      const normalizedFee = consultationFee.trim();

      return {
        specialization: specialization.trim() || undefined,
        bio: bio.trim() || undefined,
        yearsOfExperience: normalizedYears
          ? Number(normalizedYears)
          : undefined,
        consultationFee: normalizedFee ? Number(normalizedFee) : undefined,
      };
    }

    if (selectedRole === 'PARENT') {
      return {
        linkedTeenId: linkedTeenId.trim() || undefined,
      };
    }

    return {};
  };

  const renderRoleSpecificFields = () => {
    if (selectedRole === 'TEEN') {
      return (
        <>
          <CustomInput
            label={t('auth.registerRoleFields.teenSchoolLabel')}
            iconName="school-outline"
            placeholder={t('auth.registerRoleFields.teenSchoolPlaceholder')}
            value={school}
            onChangeText={setSchool}
          />
          <CustomInput
            label={t('auth.registerRoleFields.teenEmergencyLabel')}
            iconName="call-outline"
            placeholder={t('auth.registerRoleFields.teenEmergencyPlaceholder')}
            value={emergencyContact}
            onChangeText={setEmergencyContact}
          />
        </>
      );
    }

    if (selectedRole === 'THERAPIST') {
      return (
        <>
          <CustomInput
            label={t('auth.registerRoleFields.therapistSpecializationLabel')}
            iconName="medkit-outline"
            placeholder={t('auth.registerRoleFields.therapistSpecializationPlaceholder')}
            value={specialization}
            onChangeText={setSpecialization}
          />
          <CustomInput
            label={t('auth.registerRoleFields.therapistBioLabel')}
            iconName="document-text-outline"
            placeholder={t('auth.registerRoleFields.therapistBioPlaceholder')}
            value={bio}
            onChangeText={setBio}
          />
          <CustomInput
            label={t('auth.registerRoleFields.therapistYearsLabel')}
            iconName="stats-chart-outline"
            placeholder={t('auth.registerRoleFields.therapistYearsPlaceholder')}
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
          />
          <CustomInput
            label={t('auth.registerRoleFields.therapistFeeLabel')}
            iconName="cash-outline"
            placeholder={t('auth.registerRoleFields.therapistFeePlaceholder')}
            value={consultationFee}
            onChangeText={setConsultationFee}
          />
        </>
      );
    }

    if (selectedRole === 'PARENT') {
      return (
        <CustomInput
          label={t('auth.registerRoleFields.parentLinkedTeenIdLabel')}
          iconName="link-outline"
          placeholder={t('auth.registerRoleFields.parentLinkedTeenIdPlaceholder')}
          value={linkedTeenId}
          onChangeText={setLinkedTeenId}
        />
      );
    }

    return null;
  };

  const handleRegister = async () => {
    // Reset lỗi
    setEmailError(false);

    // Validate cơ bản
    if (!fullName.trim() || !email || !password || !confirmPassword) {
      Alert.alert(t('auth.common.errorTitle'), t('auth.register.validationError'));
      return;
    }

    // Check email giả định (để hiện UI lỗi giống hình)
    if (!email.includes('@')) {
      setEmailError(true);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('auth.common.errorTitle'), t('auth.register.passwordMismatch'));
      return;
    }

    if (!agreeTerm) {
      Alert.alert(t('auth.common.notificationTitle'), t('auth.register.mustAgreeTerms'));
      return;
    }

    // Gọi API Register thông qua Context
    try {
      const roleSpecificPayload = getRoleSpecificPayload();

      if (
        selectedRole === 'THERAPIST' &&
        yearsOfExperience.trim() &&
        Number.isNaN(Number(yearsOfExperience.trim()))
      ) {
        Alert.alert(t('auth.common.errorTitle'), t('auth.register.invalidYearsOfExperience'));
        return;
      }

      if (
        selectedRole === 'THERAPIST' &&
        consultationFee.trim() &&
        Number.isNaN(Number(consultationFee.trim()))
      ) {
        Alert.alert(t('auth.common.errorTitle'), t('auth.register.invalidConsultationFee'));
        return;
      }

      const payload: RegisterPayload = {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        phoneNumber: phoneNumber.trim() || undefined,
        dob: dob.trim() || undefined,
        ...roleSpecificPayload,
      };

      await auth?.register(payload);
      
      Alert.alert(t('auth.register.successTitle'), t('auth.register.successNavigateMessage'));
      navigation.navigate('Login'); // Chuyển về trang đăng nhập
    } catch (error) {
      // Nếu Backend báo lỗi (vd: Email đã tồn tại) thì nó sẽ nhảy vào đây
      Alert.alert(t('auth.register.failureTitle'), t('auth.register.failureMessage'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Background Cong */}
      <View style={styles.headerBackground}>
        <View style={styles.circle} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.title}>{t('auth.register.title')}</Text>

          <View style={styles.formContainer}>
            <CustomInput
              label={t('auth.register.fullNameLabel')}
              iconName="person-outline"
              placeholder={t('auth.register.fullNamePlaceholder')}
              value={fullName}
              onChangeText={setFullName}
            />

            <CustomInput
              label={t('auth.register.phoneLabel')}
              iconName="call-outline"
              placeholder={t('auth.register.phonePlaceholder')}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <CustomInput
              label={t('auth.register.dobLabel')}
              iconName="calendar-outline"
              placeholder={t('auth.register.dobPlaceholder')}
              value={dob}
              onChangeText={setDob}
            />

            {/* Input Email */}
            <CustomInput
              label={t('auth.register.emailLabel')}
              iconName="mail-outline"
              placeholder={t('auth.register.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              error={emailError} // Truyền prop lỗi
            />

            {/* Hộp báo lỗi Email (Chỉ hiện khi có lỗi) */}
            {emailError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.errorText} />
                <Text style={styles.errorText}>{t('auth.register.invalidEmail')}</Text>
              </View>
            )}

            {/* Mật khẩu */}
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

            {/* Xác nhận mật khẩu */}
            <CustomInput
              label={t('auth.register.confirmPasswordLabel')}
              iconName="lock-closed-outline"
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword={true}
              isPasswordVisible={showConfirmPass}
              onTogglePassword={() => setShowConfirmPass(!showConfirmPass)}
            />

            <Text style={styles.roleSectionTitle}>{t('auth.register.roleSectionTitle')}</Text>
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
                    onPress={() => setSelectedRole(option.value)}>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.roleCardText,
                        isSelected && styles.roleCardTextSelected,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {renderRoleSpecificFields()}

            {/* Checkbox Điều khoản */}
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setAgreeTerm(!agreeTerm)}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={agreeTerm ? "radio-button-on" : "radio-button-off"} 
                size={22} 
                color={COLORS.text} 
              />
              <Text style={styles.checkboxText}>
                {t('auth.register.agreePrefix')}<Text style={styles.linkText}>{t('auth.register.agreeTermsLink')}</Text>
              </Text>
            </TouchableOpacity>

            {/* Link đã có tài khoản */}
            <View style={{flexDirection: 'row', marginBottom: 20}}>
              <Text style={{color: COLORS.textSecondary}}>{t('auth.register.alreadyHaveAccount')} </Text>
               <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>{t('auth.register.loginLink')}</Text>
               </TouchableOpacity>
            </View>

            {/* Component Button */}
            <CustomButton 
              title={t('auth.register.submitButton')} 
              onPress={handleRegister} 
              isLoading={auth?.isLoading} 
            />

            {/* Hoặc */}
            <Text style={styles.orText}>{t('auth.register.orText')}</Text>

            {/* Nút Social Dài */}
            <TouchableOpacity style={styles.socialBtnLong}>
               <FontAwesome name="google" size={20} color={COLORS.google} />
               <Text style={styles.socialBtnText}>{t('auth.register.continueWithGoogle')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtnLong}>
               <FontAwesome name="facebook" size={20} color={COLORS.facebook} />
               <Text style={styles.socialBtnText}>{t('auth.register.continueWithFacebook')}</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;