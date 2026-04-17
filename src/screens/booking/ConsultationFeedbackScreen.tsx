import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AxiosError } from 'axios';
import { getTherapistDetails, submitReview, TherapistDetail } from '@/api';
import { COLORS, FONTS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import styles from '@/screens/booking/ConsultationFeedbackScreen.styles';

type ConsultationFeedbackNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ConsultationFeedback'
>;
type ConsultationFeedbackRouteProp = RouteProp<RootStackParamList, 'ConsultationFeedback'>;

const RATING_EMOJIS = ['😞', '🙁', '😐', '🙂', '😄'] as const;
const FALLBACK_AVATAR = require('../../assets/booking/doctor.png');

const parseDate = (dateValue: string | undefined): Date | null => {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const ConsultationFeedbackScreen: React.FC = () => {
  const navigation = useNavigation<ConsultationFeedbackNavigationProp>();
  const route = useRoute<ConsultationFeedbackRouteProp>();
  const { t } = useTranslation();
  const [selectedRating, setSelectedRating] = useState<number>(4);
  const [reviewText, setReviewText] = useState<string>('');
  const [therapist, setTherapist] = useState<TherapistDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  const {
    appointmentId,
    therapistId,
    slotStartDatetime,
    method,
    reason,
    therapistName,
    therapistSpecialty,
    therapistAvatarUrl,
  } = route.params;

  useEffect(() => {
    let isMounted = true;

    const loadTherapist = async (): Promise<void> => {
      try {
        const therapistDetails = await getTherapistDetails(therapistId);
        if (isMounted) {
          setTherapist(therapistDetails);
        }
      } catch {
        if (isMounted) {
          setTherapist(null);
        }
      }
    };

    void loadTherapist();

    return () => {
      isMounted = false;
    };
  }, [therapistId]);

  const startedAt = useMemo(() => parseDate(slotStartDatetime), [slotStartDatetime]);
  const summaryTime = useMemo(() => {
    if (!startedAt) {
      return '--:--';
    }

    return startedAt.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, [startedAt]);

  const summaryDate = useMemo(() => {
    if (!startedAt) {
      return '--/--/----';
    }

    return startedAt.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [startedAt]);

  const resolvedTherapistName = therapist?.fullName?.trim() || therapistName || 'Đang cập nhật';
  const resolvedTherapistSpecialty = therapist?.specialty?.trim() || therapistSpecialty || 'Đang cập nhật chuyên môn';
  const avatarSource = therapist?.avatarUrl
    ? { uri: therapist.avatarUrl }
    : therapistAvatarUrl
      ? { uri: therapistAvatarUrl }
      : FALLBACK_AVATAR;

  const methodLabel = method === 'Chat'
    ? t('booking.consultationDetail.methods.chat')
    : t('booking.consultationDetail.methods.video');

  const handleConfirmReview = async (): Promise<void> => {
    if (!appointmentId) {
      setSubmitError(t('booking.consultationFeedback.submitErrorMissingAppointment'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitReview({
        appointmentId,
        rating: selectedRating,
        comment: reviewText.trim(),
      });

      navigation.navigate('TherapistBookingLanding');
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
      const backendMessage = axiosError.response?.data?.detail ?? axiosError.response?.data?.message;
      setSubmitError(backendMessage ?? t('booking.consultationFeedback.submitErrorGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={22} color={COLORS.consultationFeedbackTitle} />
      </TouchableOpacity>

      <View style={styles.card}>
        <AppText style={styles.summaryTitle}>{t('booking.consultationFeedback.summaryTitle')}</AppText>
        <AppText style={styles.summarySubtitle}>{methodLabel}</AppText>
        <AppText style={styles.summaryTime}>{summaryTime}</AppText>
        <AppText style={styles.summaryDate}>{summaryDate}</AppText>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>{t('booking.consultationFeedback.therapistTitle')}</AppText>
        <View style={styles.therapistRow}>
          <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
          <View>
            <AppText style={styles.therapistName}>{resolvedTherapistName}</AppText>
            <AppText style={styles.therapistDescription}>{resolvedTherapistSpecialty}</AppText>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>{t('booking.consultationFeedback.ratingTitle')}</AppText>
        <View style={styles.ratingRow}>
          {RATING_EMOJIS.map((emoji, index) => (
            <TouchableOpacity
              key={emoji}
              style={styles.ratingCircle}
              activeOpacity={0.85}
              onPress={() => setSelectedRating(index + 1)}
            >
              <AppText style={styles.ratingEmoji}>{emoji}</AppText>
              {selectedRating === index + 1 ? (
                <Ionicons name="checkmark-circle" size={14} color={COLORS.consultationFeedbackPrimary} />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>{t('booking.consultationFeedback.reviewTitle')}</AppText>
        <TextInput
          style={[styles.input, { fontFamily: FONTS.regular }]}
          placeholder={t('booking.consultationFeedback.feedbackPlaceholder')}
          placeholderTextColor={COLORS.consultationFeedbackSecondary}
          multiline
          value={reviewText}
          onChangeText={setReviewText}
        />
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>{t('booking.consultationFeedback.homeworkTitle')}</AppText>
        <AppText style={styles.subtitleStrong}>{t('booking.consultationFeedback.homeworkSubtitle')}</AppText>
        <AppText style={styles.descriptionText}>
          {t('booking.consultationFeedback.homeworkDescription')}
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>{t('booking.consultationFeedback.reasonTitle')}</AppText>
        <AppText style={styles.descriptionText}>{reason || t('booking.consultationFeedback.noReason')}</AppText>
      </View>

      {submitError ? <AppText style={styles.submitErrorText}>{submitError}</AppText> : null}

      <TouchableOpacity
        style={styles.confirmButton}
        activeOpacity={0.9}
        onPress={() => void handleConfirmReview()}
        disabled={isSubmitting}
      >
        <AppText style={styles.confirmButtonText}>
          {isSubmitting
            ? t('booking.consultationFeedback.submittingButton')
            : t('booking.consultationFeedback.confirmButton')}
        </AppText>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ConsultationFeedbackScreen;
