import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import styles from './WaitingRoomScreen.styles';

type WaitingRoomRouteProp = RouteProp<RootStackParamList, 'WaitingRoom'>;
type WaitingRoomNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WaitingRoom'>;

const FALLBACK_REASON =
  'Bạn đang cảm thấy áp lực và mong muốn nhận được sự hỗ trợ từ chuyên gia để cải thiện tinh thần.';

const WaitingRoomScreen: React.FC = () => {
  const navigation = useNavigation<WaitingRoomNavigationProp>();
  const route = useRoute<WaitingRoomRouteProp>();
  const {
    date,
    time,
    method,
    reason = FALLBACK_REASON,
  } = route.params;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={22} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tham vấn chuyên gia</Text>
        <Text style={styles.cardSubtitle}>{method}</Text>

        <View style={styles.timeDateRow}>
          <Text style={styles.timeText}>{time}</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>

        <View style={styles.statusBadge}>
          <Ionicons name="time-outline" size={14} color={COLORS.primary} />
          <Text style={styles.statusText}>Buổi tham vấn đang diễn ra</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.joinButton}
          onPress={() => navigation.navigate('VideoConsultation')}
        >
          <Text style={styles.joinButtonText}>Tham gia</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.infoTitle}>Lí do</Text>
        <Text style={styles.reasonText}>{reason}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.infoTitle}>Chuyên gia tâm lý</Text>
        <View style={styles.therapistRow}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person-outline" size={30} color={COLORS.textSecondary} />
          </View>

          <View style={styles.therapistInfo}>
            <Text style={styles.therapistName}>Nguyen Van A</Text>
            <Text style={styles.therapistDescription}>
              Chuyên gia tư vấn với kinh nghiệm hỗ trợ sức khỏe tinh thần.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default WaitingRoomScreen;
