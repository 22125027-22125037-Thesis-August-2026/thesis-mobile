import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../navigation/types';
import styles from './ConsultationDetailScreen.styles';

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
              <Text style={styles.headerTitle}>Tham vấn chuyên gia</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Bạn mong muốn gì sau buổi tham vấn</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Miêu tả tình trạng, triệu chứng, mong muốn hiện tại của bạn"
              placeholderTextColor={COLORS.placeholder}
              multiline
              value={description}
              onChangeText={setDescription}
            />
            <Text style={styles.metaText}>{`Lịch hẹn đã chọn: ${selectedDate} - ${selectedTime}`}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.methodTitle}>Bạn muốn giao tiếp với chuyên gia như thế nào</Text>
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
                <Text
                  style={[
                    styles.methodButtonText,
                    selectedMethod === 'Video'
                      ? styles.methodButtonTextActive
                      : styles.methodButtonTextInactive,
                  ]}
                >
                  Video
                </Text>
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
                <Text
                  style={[
                    styles.methodButtonText,
                    selectedMethod === 'Chat'
                      ? styles.methodButtonTextActive
                      : styles.methodButtonTextInactive,
                  ]}
                >
                  Chat
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} activeOpacity={0.85} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Tiếp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConsultationDetailScreen;
