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

const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerm, setAgreeTerm] = useState(false);
  
  // State hiển thị mật khẩu
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // State lỗi (demo giống hình)
  const [emailError, setEmailError] = useState(false);

  const auth = useContext(AuthContext);

  const handleRegister = async () => {
    // Reset lỗi
    setEmailError(false);

    // Validate cơ bản
    if (!email || !password || !confirmPassword) {
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
      // Dùng await để chờ API chạy xong
      await auth?.register(email, password); 
      
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
               <Text style={{color: '#666'}}>Đã có tài khoản? </Text>
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