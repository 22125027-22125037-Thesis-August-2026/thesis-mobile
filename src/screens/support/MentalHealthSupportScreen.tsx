import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import {
  CrisisResource,
  EMERGENCY_RESOURCES,
  SUPPORT_HOTLINES,
} from '@/constants/crisisResources';
import {
  EmergencyContact,
  clearEmergencyContact,
  loadEmergencyContact,
  saveEmergencyContact,
} from '@/utils/emergencyContact';
import { COLORS } from '@/theme';
import { styles } from './MentalHealthSupportScreen.styles';

type Nav = NavigationProp<RootStackParamList>;

const dialPhone = async (phone: string, display: string): Promise<void> => {
  const url = `tel:${phone}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Không thể gọi', `Hãy gọi số ${display} theo cách thủ công.`);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert('Không thể gọi', `Hãy gọi số ${display} theo cách thủ công.`);
  }
};

const callResource = (resource: CrisisResource): void => {
  if (!resource.phone) {
    return;
  }
  void dialPhone(resource.phone, resource.phoneDisplay ?? resource.phone);
};

const MentalHealthSupportScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftPhone, setDraftPhone] = useState('');

  useEffect(() => {
    void loadEmergencyContact().then(setContact);
  }, []);

  const openEditor = (): void => {
    setDraftName(contact?.name ?? '');
    setDraftPhone(contact?.phone ?? '');
    setEditVisible(true);
  };

  const handleSaveContact = async (): Promise<void> => {
    const phone = draftPhone.trim();
    if (phone.length === 0) {
      return;
    }
    const next: EmergencyContact = {
      name: draftName.trim() || 'Người thân',
      phone,
    };
    await saveEmergencyContact(next);
    setContact(next);
    setEditVisible(false);
  };

  const handleRemoveContact = async (): Promise<void> => {
    await clearEmergencyContact();
    setContact(null);
    setEditVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ===== HERO ===== */}
        <View style={styles.hero}>
          <View style={styles.heroCircleLarge} />
          <View style={styles.heroCircleSmall} />

          <View style={styles.heroTopRow}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={22} color={COLORS.white} />
            </Pressable>
            <AppText style={styles.heroEyebrow}>Tìm trợ giúp ngay</AppText>
            <View style={styles.backButton} />
          </View>

          <AppText style={styles.heroTitle}>Bạn không đơn độc 🤍</AppText>
          <AppText style={styles.heroSubtitle}>
            Nếu bạn đang cảm thấy quá tải hoặc có ý nghĩ làm hại bản thân, hãy liên
            hệ ngay. Luôn có người sẵn sàng lắng nghe bạn — miễn phí và bảo mật.
          </AppText>
        </View>

        <View style={styles.body}>
          {/* ===== EMERGENCY BANNER ===== */}
          <View style={styles.emergencyBanner}>
            <View style={styles.emergencyHeaderRow}>
              <MaterialCommunityIcons
                name="alert-octagon"
                size={20}
                color={COLORS.supportEmergencyDeep}
              />
              <AppText style={styles.emergencyTitle}>Nguy hiểm tức thời?</AppText>
            </View>
            <AppText style={styles.emergencyText}>
              Nếu bạn hoặc ai đó đang gặp nguy hiểm ngay lúc này, hãy gọi cấp cứu.
            </AppText>
            <View style={styles.emergencyButtonsRow}>
              {EMERGENCY_RESOURCES.map(resource => (
                <Pressable
                  key={resource.id}
                  style={styles.emergencyButton}
                  onPress={() => callResource(resource)}
                >
                  <MaterialCommunityIcons
                    name={resource.icon}
                    size={18}
                    color={COLORS.white}
                  />
                  <AppText style={styles.emergencyButtonText}>
                    {resource.phoneDisplay}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ===== PERSONAL EMERGENCY CONTACT ===== */}
          <AppText style={styles.sectionLabel}>Người thân của bạn</AppText>
          {contact ? (
            <View style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <MaterialCommunityIcons
                  name="account-heart"
                  size={22}
                  color={COLORS.supportEmergencyDeep}
                />
              </View>
              <View style={styles.contactText}>
                <AppText style={styles.contactName}>{contact.name}</AppText>
                <AppText style={styles.contactPhone}>{contact.phone}</AppText>
              </View>
              <Pressable
                hitSlop={8}
                style={styles.contactEdit}
                onPress={openEditor}
              >
                <Feather name="edit-2" size={16} color={COLORS.textTertiary} />
              </Pressable>
              <Pressable
                style={styles.contactCallButton}
                onPress={() => void dialPhone(contact.phone, contact.name)}
              >
                <MaterialCommunityIcons name="phone" size={18} color={COLORS.white} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.contactAddCard} onPress={openEditor}>
              <Feather name="plus-circle" size={20} color={COLORS.supportHeaderDeep} />
              <AppText style={styles.contactAddText}>
                Thêm người thân để gọi nhanh khi cần
              </AppText>
            </Pressable>
          )}

          {/* ===== HOTLINES ===== */}
          <AppText style={styles.sectionLabel}>Đường dây lắng nghe</AppText>
          {SUPPORT_HOTLINES.map(resource => (
            <HotlineCard
              key={resource.id}
              resource={resource}
              onCall={() => callResource(resource)}
            />
          ))}

          {/* ===== IN-APP SUPPORT ===== */}
          <AppText style={styles.sectionLabel}>Trong ứng dụng</AppText>

          <Pressable
            style={styles.inAppCard}
            onPress={() => navigation.navigate('MatchingForm')}
          >
            <View style={[styles.inAppIcon, { backgroundColor: COLORS.supportSoft }]}>
              <MaterialCommunityIcons
                name="account-heart"
                size={22}
                color={COLORS.supportHeaderDeep}
              />
            </View>
            <View style={styles.inAppText}>
              <AppText style={styles.inAppTitle}>Trò chuyện với chuyên gia</AppText>
              <AppText style={styles.inAppSubtitle}>
                Kết nối với nhà tâm lý của chúng tôi
              </AppText>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
          </Pressable>

          <Pressable
            style={styles.inAppCard}
            onPress={() => navigation.navigate('Chat')}
          >
            <View style={[styles.inAppIcon, { backgroundColor: COLORS.primaryMuted }]}>
              <MaterialCommunityIcons
                name="robot-happy-outline"
                size={22}
                color={COLORS.primaryDark}
              />
            </View>
            <View style={styles.inAppText}>
              <AppText style={styles.inAppTitle}>Bạn Tâm Giao</AppText>
              <AppText style={styles.inAppSubtitle}>
                Người bạn AI luôn sẵn sàng lắng nghe bạn
              </AppText>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
          </Pressable>

          <Pressable
            style={styles.inAppCard}
            onPress={() => navigation.navigate('MessageList')}
          >
            <View style={[styles.inAppIcon, { backgroundColor: COLORS.comfortSoft }]}>
              <MaterialCommunityIcons
                name="message-text-outline"
                size={22}
                color={COLORS.comfortHeaderDeep}
              />
            </View>
            <View style={styles.inAppText}>
              <AppText style={styles.inAppTitle}>Tin nhắn của bạn</AppText>
              <AppText style={styles.inAppSubtitle}>
                Nhắn tin với chuyên gia hoặc người bạn đồng hành
              </AppText>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
          </Pressable>

          <Pressable
            style={styles.inAppCard}
            onPress={() => navigation.navigate('BreathingMain')}
          >
            <View style={[styles.inAppIcon, { backgroundColor: COLORS.breathingSoft }]}>
              <MaterialCommunityIcons
                name="meditation"
                size={22}
                color={COLORS.breathingHeader}
              />
            </View>
            <View style={styles.inAppText}>
              <AppText style={styles.inAppTitle}>Hít thở cùng nhau</AppText>
              <AppText style={styles.inAppSubtitle}>
                Một phút thở để lấy lại bình tĩnh
              </AppText>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
          </Pressable>

          {/* ===== REASSURANCE FOOTER ===== */}
          <View style={styles.footer}>
            <AppText style={styles.footerText}>
              Cảm giác khó khăn rồi sẽ qua. Tìm sự giúp đỡ là một hành động dũng
              cảm, không phải sự yếu đuối. 💚
            </AppText>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* ===== EDIT EMERGENCY CONTACT MODAL ===== */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <AppText style={styles.modalTitle}>Người thân để gọi khi cần</AppText>
              <Pressable onPress={() => setEditVisible(false)}>
                <Feather name="x" size={22} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <AppText style={styles.fieldLabel}>Tên / mối quan hệ</AppText>
            <TextInput
              style={styles.input}
              placeholder="VD: Mẹ, Bố, bạn thân…"
              placeholderTextColor={COLORS.placeholder}
              value={draftName}
              onChangeText={setDraftName}
              maxLength={40}
            />

            <AppText style={styles.fieldLabel}>Số điện thoại</AppText>
            <TextInput
              style={styles.input}
              placeholder="VD: 098 xxx xxxx"
              placeholderTextColor={COLORS.placeholder}
              value={draftPhone}
              onChangeText={setDraftPhone}
              keyboardType="phone-pad"
              maxLength={20}
            />

            <Pressable
              style={[
                styles.modalSaveButton,
                draftPhone.trim().length === 0 && styles.modalSaveButtonDisabled,
              ]}
              disabled={draftPhone.trim().length === 0}
              onPress={() => void handleSaveContact()}
            >
              <AppText style={styles.modalSaveText}>Lưu</AppText>
            </Pressable>

            {contact && (
              <Pressable
                style={styles.modalRemoveButton}
                onPress={() => void handleRemoveContact()}
              >
                <AppText style={styles.modalRemoveText}>Xoá người thân này</AppText>
              </Pressable>
            )}
            <View style={styles.modalBottomSpacer} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const HotlineCard: React.FC<{
  resource: CrisisResource;
  onCall: () => void;
}> = ({ resource, onCall }) => (
  <View style={styles.hotlineCard}>
    <View style={styles.hotlineHeaderRow}>
      <View style={styles.hotlineIcon}>
        <MaterialCommunityIcons
          name={resource.icon}
          size={22}
          color={COLORS.supportHeaderDeep}
        />
      </View>
      <View style={styles.hotlineHeaderText}>
        <AppText style={styles.hotlineName}>{resource.name}</AppText>
        <View style={styles.hotlineBadgeRow}>
          <View style={styles.hotlineBadge}>
            <Feather name="clock" size={11} color={COLORS.supportHeaderDeep} />
            <AppText style={styles.hotlineBadgeText}>{resource.hours}</AppText>
          </View>
          {resource.free && (
            <View style={styles.hotlineBadge}>
              <AppText style={styles.hotlineBadgeText}>Miễn phí</AppText>
            </View>
          )}
        </View>
      </View>
    </View>

    <AppText style={styles.hotlineDescription}>{resource.description}</AppText>

    <Pressable style={styles.callButton} onPress={onCall}>
      <MaterialCommunityIcons name="phone" size={18} color={COLORS.white} />
      <AppText style={styles.callButtonText}>Gọi {resource.phoneDisplay}</AppText>
    </Pressable>
  </View>
);

export default MentalHealthSupportScreen;
