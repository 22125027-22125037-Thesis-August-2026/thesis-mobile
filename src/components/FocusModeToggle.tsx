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
  getQuietHours,
  type QuietHours,
} from '@/utils/focusModeNotifications';

interface Props {
  /**
   * 'card'  — standalone card with shadow (default)
   * 'row'   — flat row designed to live inside a menuCard View
   */
  variant?: 'card' | 'row';
  isLast?: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

const FocusModeToggle: React.FC<Props> = ({ variant = 'card', isLast = false }) => {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quiet, setQuiet] = useState<QuietHours>({ start: 22, end: 7 });

  useEffect(() => {
    Promise.all([getFocusModeEnabled(), getQuietHours()]).then(([on, q]) => {
      setEnabled(on);
      setQuiet(q);
      setLoading(false);
    });
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
    <View style={[isRow ? styles.row : styles.card, isRow && !isLast && styles.rowBorder]}>
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
        <AppText style={styles.subtitle}>
          {t(enabled ? 'profile.focusMode.subtitleOn' : 'profile.focusMode.subtitleOff')}
        </AppText>
        {enabled && (
          <AppText style={styles.quietBadge}>
            {t('profile.focusMode.quietBadge', {
              start: pad(quiet.start),
              end: pad(quiet.end),
            })}
          </AppText>
        )}
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
  row: {
    ...ROW_BASE,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
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
  quietBadge: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 3,
  },
  loader: {
    marginHorizontal: 4,
  },
});

export default FocusModeToggle;
