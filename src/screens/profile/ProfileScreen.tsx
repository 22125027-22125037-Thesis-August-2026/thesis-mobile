import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText, CustomButton } from '@/components';
import { AuthContext } from '@/context/AuthContext';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './ProfileScreen.styles';

const ProfileScreen: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();

  if (!authContext) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <AppText style={styles.errorText}>
            {t('profile.errorLoadingProfile')}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const { userInfo, logout } = authContext;

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        {
          text: t('profile.logoutConfirmCancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('profile.logoutConfirmAction'),
          onPress: () => {
            logout();
          },
          style: 'destructive',
        },
      ],
    );
  };

  const avatarUrl = userInfo?.avatarUrl ?? 'https://via.placeholder.com/100';
  const fullName = userInfo?.fullName ?? 'User';
  const email = userInfo?.email ?? 'user@example.com';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText style={styles.headerTitle}>
            {t('profile.headerTitle')}
          </AppText>
        </View>

        {/* Avatar & User Info */}
        <View style={styles.userInfoCard}>
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            defaultSource={require('../../assets/booking/placeholder.png')}
          />
          <AppText style={styles.fullName}>{fullName}</AppText>
          <AppText style={styles.email}>{email}</AppText>
        </View>

        {/* User Details */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            {t('profile.personalInfoTitle')}
          </AppText>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color="#97AF61"
              />
            </View>
            <View style={styles.detailContent}>
              <AppText style={styles.detailLabel}>
                {t('profile.fullNameLabel')}
              </AppText>
              <AppText style={styles.detailValue}>{fullName}</AppText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Feather name="mail" size={24} color="#97AF61" />
            </View>
            <View style={styles.detailContent}>
              <AppText style={styles.detailLabel}>
                {t('profile.emailLabel')}
              </AppText>
              <AppText style={styles.detailValue}>{email}</AppText>
            </View>
          </View>

          {userInfo?.role && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons
                    name="briefcase"
                    size={24}
                    color="#97AF61"
                  />
                </View>
                <View style={styles.detailContent}>
                  <AppText style={styles.detailLabel}>
                    {t('profile.roleLabel')}
                  </AppText>
                  <AppText style={styles.detailValue}>{userInfo.role}</AppText>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <CustomButton
            onPress={handleLogout}
            title={t('profile.logoutButton')}
          />
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
