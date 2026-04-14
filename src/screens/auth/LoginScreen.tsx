import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { CustomButton, CustomInput, AppText } from '@/components';
import { COLORS } from '@/theme';
import { AuthContext } from '@/context/AuthContext';
import { styles } from '@/screens/auth/LoginScreen.styles';

const LoginScreen = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const auth = useContext(AuthContext);
  const navigation = useNavigation<any>();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert(
        t('auth.common.notificationTitle'),
        t('auth.login.validationError'),
      );
      return;
    }
    auth?.login(email, password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.headerBackground}>
        <View style={styles.circle} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <AppText style={styles.title}>{t('auth.login.title')}</AppText>
          </View>

          <View style={styles.formContainer}>
            <CustomInput
              label={t('auth.login.emailLabel')}
              iconName="mail-outline"
              placeholder={t('auth.login.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
            />

            <CustomInput
              label={t('auth.login.passwordLabel')}
              iconName="lock-closed-outline"
              placeholder={t('auth.login.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              isPasswordVisible={isPasswordVisible}
              onTogglePassword={() => setIsPasswordVisible(!isPasswordVisible)}
            />

            <CustomButton
              title={t('auth.login.submitButton')}
              onPress={handleLogin}
              isLoading={auth?.isLoading}
            />

            <View style={styles.socialContainer}>
              {[
                { icon: 'facebook', color: COLORS.facebook },
                { icon: 'google', color: COLORS.google },
                { icon: 'instagram', color: COLORS.instagram },
              ].map((item, index) => (
                <TouchableOpacity key={index} style={styles.socialButton}>
                  <FontAwesome name={item.icon} size={20} color={item.color} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.footer}>
              <AppText style={styles.footerText}>
                {t('auth.login.noAccountText')}{' '}
                <AppText style={styles.linkText} onPress={() => navigation.navigate('Register')}>
                  {t('auth.login.registerLink')}
                </AppText>
              </AppText>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    t('auth.common.notificationTitle'),
                    t('auth.login.forgotPasswordMessage'),
                  )
                }>
                <AppText style={[styles.linkText, styles.forgotPasswordLink]}>
                  {t('auth.login.forgotPassword')}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;