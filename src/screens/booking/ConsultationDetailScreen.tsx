import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import styles from '@/screens/booking/ConsultationDetailScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ConsultationDetail'>;
type ConsultationDetailRouteProp = RouteProp<RootStackParamList, 'ConsultationDetail'>;

type CommunicationMethod = 'Video' | 'Chat';

const ConsultationDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ConsultationDetailRouteProp>();
  const [description, setDescription] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<CommunicationMethod>('Video');

  const { selectedDate, selectedTime } = route.params;

  const handleNext = () => {
    navigation.navigate('WaitingRoom', {
      date: selectedDate,
      time: selectedTime,
      method: selectedMethod,
      reason: description,
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} />
              </View>
              <AppText style={styles.headerTitle}>Tham vấn chuyên gia</AppText>
            </View>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>Bạn mong muốn gì sau buổi tham vấn</AppText>
            <TextInput
              style={[styles.textArea, { fontFamily: FONTS.regular }]}
              placeholder="Miêu tả tình trạng, triệu chứng, mong muốn hiện tại của bạn"
              placeholderTextColor={COLORS.placeholder}
              multiline
              value={description}
              onChangeText={setDescription}
            />
            <AppText style={styles.metaText}>{`Lịch hẹn đã chọn: ${selectedDate} - ${selectedTime}`}</AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.methodTitle}>Bạn muốn giao tiếp với chuyên gia như thế nào</AppText>
            <View style={styles.methodRow}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  selectedMethod === 'Video' ? styles.methodButtonActive : styles.methodButtonInactive,
                ]}
                onPress={() => setSelectedMethod('Video')}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="videocam-outline"
                  size={18}
                  color={selectedMethod === 'Video' ? COLORS.text : COLORS.textSecondary}
                />
                <AppText
                  style={[
                    styles.methodButtonText,
                    selectedMethod === 'Video'
                      ? styles.methodButtonTextActive
                      : styles.methodButtonTextInactive,
                  ]}
                >
                  Video
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  selectedMethod === 'Chat' ? styles.methodButtonActive : styles.methodButtonInactive,
                ]}
                onPress={() => setSelectedMethod('Chat')}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color={selectedMethod === 'Chat' ? COLORS.text : COLORS.textSecondary}
                />
                <AppText
                  style={[
                    styles.methodButtonText,
                    selectedMethod === 'Chat'
                      ? styles.methodButtonTextActive
                      : styles.methodButtonTextInactive,
                  ]}
                >
                  Chat
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} activeOpacity={0.85} onPress={handleNext}>
          <AppText style={styles.nextButtonText}>Tiếp</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConsultationDetailScreen;
