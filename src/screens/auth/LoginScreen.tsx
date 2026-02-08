import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// Import Logic & Components
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

// Import Styles từ file bên cạnh
import { styles } from './LoginScreen.styles';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Lấy context
  const auth = useContext(AuthContext);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    // Dùng optional chaining (?.) để an toàn
    auth?.login(email, password);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar dùng màu background từ constants cho đồng bộ */}
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Background cong */}
      <View style={styles.headerBackground}>
        <View style={styles.circle} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Đăng nhập</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Component Input: Email */}
            <CustomInput
              label="Email"
              iconName="mail-outline"
              placeholder="Nhập email..."
              value={email}
              onChangeText={setEmail}
            />

            {/* Component Input: Password */}
            <CustomInput
              label="Mật khẩu"
              iconName="lock-closed-outline"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              isPasswordVisible={isPasswordVisible}
              onTogglePassword={() => setIsPasswordVisible(!isPasswordVisible)}
            />

            {/* Component Button */}
            <CustomButton 
              title="Đăng nhập" 
              onPress={handleLogin} 
              isLoading={auth?.isLoading} 
            />

            {/* Social Icons */}
            <View style={styles.socialContainer}>
              {[ 
                { icon: 'facebook', color: COLORS.facebook },
                { icon: 'google', color: COLORS.google },
                { icon: 'instagram', color: COLORS.instagram }
              ].map((item, index) => (
                <TouchableOpacity key={index} style={styles.socialButton}>
                  <FontAwesome name={item.icon} size={20} color={item.color} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Chưa có tài khoản?{' '}
                <Text style={styles.linkText} onPress={() => Alert.alert('Nav', 'Sang trang Đăng ký')}>
                  Đăng kí
                </Text>
              </Text>
              <TouchableOpacity onPress={() => Alert.alert('Nav', 'Quên mật khẩu')}>
                <Text style={[styles.linkText, { marginTop: 10 }]}>Quên mật khẩu</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;