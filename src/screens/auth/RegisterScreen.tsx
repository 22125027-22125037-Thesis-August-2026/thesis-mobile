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

// Import
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import CustomInput from '../../components/CustomInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './RegisterScreen.styles';
import CustomButton from '../../components/CustomButton';
import { RegisterPayload, UserRole } from '../../types/auth';

const RegisterScreen = ({ navigation }: any) => {
  const ROLE_OPTIONS: Array<{ label: string; value: UserRole }> = [
    { label: 'Học sinh/Sinh viên', value: 'TEEN' },
    { label: 'Phụ huynh/Người thân', value: 'PARENT' },
    { label: 'Bác sĩ tâm lý', value: 'THERAPIST' },
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
            label="Trường học"
            iconName="school-outline"
            placeholder="Nhập trường học (không bắt buộc)"
            value={school}
            onChangeText={setSchool}
          />
          <CustomInput
            label="Liên hệ khẩn cấp"
            iconName="call-outline"
            placeholder="Số điện thoại hoặc người liên hệ"
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
            label="Chuyên môn"
            iconName="medkit-outline"
            placeholder="Ví dụ: Tâm lý học lâm sàng"
            value={specialization}
            onChangeText={setSpecialization}
          />
          <CustomInput
            label="Giới thiệu"
            iconName="document-text-outline"
            placeholder="Tóm tắt kinh nghiệm và phương pháp"
            value={bio}
            onChangeText={setBio}
          />
          <CustomInput
            label="Số năm kinh nghiệm"
            iconName="stats-chart-outline"
            placeholder="Ví dụ: 5"
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
          />
          <CustomInput
            label="Phí tư vấn (VND)"
            iconName="cash-outline"
            placeholder="Ví dụ: 300000"
            value={consultationFee}
            onChangeText={setConsultationFee}
          />
        </>
      );
    }

    if (selectedRole === 'PARENT') {
      return (
        <CustomInput
          label="Linked Teen ID"
          iconName="link-outline"
          placeholder="UUID hồ sơ teen (không bắt buộc)"
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
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Check email giả định (để hiện UI lỗi giống hình)
    if (!email.includes('@')) {
      setEmailError(true);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (!agreeTerm) {
      Alert.alert('Thông báo', 'Bạn cần đồng ý với Điều khoản và Điều kiện');
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
        Alert.alert('Lỗi', 'Số năm kinh nghiệm phải là số hợp lệ');
        return;
      }

      if (
        selectedRole === 'THERAPIST' &&
        consultationFee.trim() &&
        Number.isNaN(Number(consultationFee.trim()))
      ) {
        Alert.alert('Lỗi', 'Phí tư vấn phải là số hợp lệ');
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
      
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigation.navigate('Login'); // Chuyển về trang đăng nhập
    } catch (error) {
      // Nếu Backend báo lỗi (vd: Email đã tồn tại) thì nó sẽ nhảy vào đây
      Alert.alert('Đăng ký thất bại', 'Email này có thể đã được sử dụng. Vui lòng thử lại.');
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
          
          <Text style={styles.title}>Đăng kí</Text>

          <View style={styles.formContainer}>
            <CustomInput
              label="Họ và tên"
              iconName="person-outline"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChangeText={setFullName}
            />

            <CustomInput
              label="Số điện thoại"
              iconName="call-outline"
              placeholder="Nhập số điện thoại (không bắt buộc)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <CustomInput
              label="Ngày sinh"
              iconName="calendar-outline"
              placeholder="YYYY-MM-DD (không bắt buộc)"
              value={dob}
              onChangeText={setDob}
            />

            {/* Input Email */}
            <CustomInput
              label="Email"
              iconName="mail-outline"
              placeholder="Nhập email"
              value={email}
              onChangeText={setEmail}
              error={emailError} // Truyền prop lỗi
            />

            {/* Hộp báo lỗi Email (Chỉ hiện khi có lỗi) */}
            {emailError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.errorText} />
                <Text style={styles.errorText}>Email không hợp lệ</Text>
              </View>
            )}

            {/* Mật khẩu */}
            <CustomInput
              label="Mật khẩu"
              iconName="lock-closed-outline"
              placeholder="Tạo mật khẩu mới"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              isPasswordVisible={showPass}
              onTogglePassword={() => setShowPass(!showPass)}
            />

            {/* Xác nhận mật khẩu */}
            <CustomInput
              label="Xác nhận mật khẩu"
              iconName="lock-closed-outline"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword={true}
              isPasswordVisible={showConfirmPass}
              onTogglePassword={() => setShowConfirmPass(!showConfirmPass)}
            />

            <Text style={styles.roleSectionTitle}>Bạn đăng ký với vai trò:</Text>
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
                Tôi đồng ý với <Text style={styles.linkText}>Điều khoản và Điều kiện</Text>
              </Text>
            </TouchableOpacity>

            {/* Link đã có tài khoản */}
            <View style={{flexDirection: 'row', marginBottom: 20}}>
              <Text style={{color: COLORS.textSecondary}}>Đã có tài khoản? </Text>
               <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Đăng nhập.</Text>
               </TouchableOpacity>
            </View>

            {/* Component Button */}
            <CustomButton 
              title="Đăng kí" 
              onPress={handleRegister} 
              isLoading={auth?.isLoading} 
            />

            {/* Hoặc */}
            <Text style={styles.orText}>hoặc</Text>

            {/* Nút Social Dài */}
            <TouchableOpacity style={styles.socialBtnLong}>
               <FontAwesome name="google" size={20} color={COLORS.google} />
               <Text style={styles.socialBtnText}>Tiếp tục với Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtnLong}>
               <FontAwesome name="facebook" size={20} color={COLORS.facebook} />
               <Text style={styles.socialBtnText}>Tiếp tục với Facebook</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;