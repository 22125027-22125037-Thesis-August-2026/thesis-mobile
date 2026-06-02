import React, { useEffect, useState } from 'react';
import {
  View,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from './AppText';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';
import {
  scheduleFocusModeNotifications,
  cancelFocusModeNotifications,
  getFocusModeEnabled,
} from '@/utils/focusModeNotifications';

interface Props {
  /**
   * 'card'  — standalone card with shadow (default, for use outside a menu list)
   * 'row'   — flat row, no shadow/border-radius, designed to live inside a menuCard View
   */
  variant?: 'card' | 'row';
  /** When variant='row', hide the bottom border on the last item */
  isLast?: boolean;
}

const FocusModeToggle: React.FC<Props> = ({ variant = 'card', isLast = false }) => {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFocusModeEnabled()
      .then(setEnabled)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (value: boolean) => {
    setLoading(true);
    try {
      if (value) {
        await scheduleFocusModeNotifications();
      } else {
        await cancelFocusModeNotifications();
      }
      setEnabled(value);
    } catch {
      Alert.alert(
        t('profile.focusMode.errorTitle'),
        t('profile.focusMode.errorMessage'),
      );
    } finally {
      setLoading(false);
    }
  };

  const isRow = variant === 'row';

  return (
    <View
      style={[
        isRow ? styles.row : styles.card,
        isRow && !isLast && styles.rowBorder,
      ]}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, enabled && styles.iconContainerActive]}>
        <MaterialCommunityIcons
          name="bell-ring-outline"
          size={22}
          color={enabled ? COLORS.white : COLORS.primary}
        />
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <AppText style={styles.title}>{t('profile.focusMode.title')}</AppText>
        <AppText style={styles.subtitle} numberOfLines={2}>
          {t(enabled ? 'profile.focusMode.subtitleOn' : 'profile.focusMode.subtitleOff')}
        </AppText>
      </View>

      {/* Control */}
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
      ) : (
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ false: COLORS.borderSubtle, true: COLORS.primaryLight }}
          thumbColor={
            Platform.OS === 'android'
              ? enabled ? COLORS.primary : COLORS.white
              : undefined
          }
        />
      )}
    </View>
  );
};

const ROW_BASE = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  paddingHorizontal: SPACING.md,
  paddingVertical: 14,
};

const styles = StyleSheet.create({
  // ── standalone card ──────────────────────────────────────────────────────────
  card: {
    ...ROW_BASE,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.card,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  // ── menu-row variant (no shadow — parent menuCard provides it) ────────────────
  row: {
    ...ROW_BASE,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  // ── shared ───────────────────────────────────────────────────────────────────
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconContainerActive: {
    backgroundColor: COLORS.primary,
  },
  textBlock: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  loader: {
    marginHorizontal: 4,
  },
});

export default FocusModeToggle;
