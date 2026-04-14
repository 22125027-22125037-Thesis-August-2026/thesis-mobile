import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';
import styles from '@/screens/booking/WaitingRoomScreen.styles';

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
        <AppText style={styles.cardTitle}>Tham vấn chuyên gia</AppText>
        <AppText style={styles.cardSubtitle}>{method}</AppText>

        <View style={styles.timeDateRow}>
          <AppText style={styles.timeText}>{time}</AppText>
          <AppText style={styles.dateText}>{date}</AppText>
        </View>

        <View style={styles.statusBadge}>
          <Ionicons name="time-outline" size={14} color={COLORS.primary} />
          <AppText style={styles.statusText}>Buổi tham vấn đang diễn ra</AppText>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.joinButton}
          onPress={() => navigation.navigate('VideoConsultation')}
        >
          <AppText style={styles.joinButtonText}>Tham gia</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <AppText style={styles.infoTitle}>Lí do</AppText>
        <AppText style={styles.reasonText}>{reason}</AppText>
      </View>

      <View style={styles.card}>
        <AppText style={styles.infoTitle}>Chuyên gia tâm lý</AppText>
        <View style={styles.therapistRow}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person-outline" size={30} color={COLORS.textSecondary} />
          </View>

          <View style={styles.therapistInfo}>
            <AppText style={styles.therapistName}>Nguyen Van A</AppText>
            <AppText style={styles.therapistDescription}>
              Chuyên gia tư vấn với kinh nghiệm hỗ trợ sức khỏe tinh thần.
            </AppText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default WaitingRoomScreen;
