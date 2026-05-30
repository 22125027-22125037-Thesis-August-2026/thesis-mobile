import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import AppText from './AppText';
import type { AppointmentStatus } from '@/api';

type Variant = {
  bg: string;
  fg: string;
  icon: string;
  i18nKey: string;
};

const VARIANTS: Record<AppointmentStatus, Variant> = {
  REQUESTED: {
    bg: '#FFF3CD',
    fg: '#856404',
    icon: 'time-outline',
    i18nKey: 'booking.status.requested',
  },
  UPCOMING: {
    bg: '#D4EDDA',
    fg: '#155724',
    icon: 'checkmark-circle-outline',
    i18nKey: 'booking.status.upcoming',
  },
  IN_PROGRESS: {
    bg: '#D1ECF1',
    fg: '#0C5460',
    icon: 'videocam-outline',
    i18nKey: 'booking.status.inProgress',
  },
  COMPLETED: {
    bg: '#E2E3E5',
    fg: '#383D41',
    icon: 'checkmark-done-outline',
    i18nKey: 'booking.status.completed',
  },
  CANCELLED: {
    bg: '#F8D7DA',
    fg: '#721C24',
    icon: 'close-circle-outline',
    i18nKey: 'booking.status.cancelled',
  },
};

type Props = {
  status: AppointmentStatus;
  style?: ViewStyle;
};

const AppointmentStatusBadge: React.FC<Props> = ({ status, style }) => {
  const { t } = useTranslation();
  const variant = VARIANTS[status] ?? VARIANTS.UPCOMING;

  return (
    <View style={[styles.badge, { backgroundColor: variant.bg }, style]}>
      <Ionicons name={variant.icon} size={14} color={variant.fg} />
      <AppText style={[styles.text, { color: variant.fg }]}>
        {t(variant.i18nKey)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
});

export { AppointmentStatusBadge };
export default AppointmentStatusBadge;
