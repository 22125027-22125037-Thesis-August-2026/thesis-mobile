import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { NutritionStatus } from '@/hooks/useHomeDashboardData';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

const WATER_CELL_LITERS = 0.25;

interface NutritionMiniDashboardProps {
  waterLiters: number;
  waterGoal: number;
  weekScore: number;
  status: NutritionStatus;
}

const STATUS_I18N_KEY: Record<NutritionStatus, string> = {
  tot: 'home.dashboards.nutrition.statusTot',
  binhThuong: 'home.dashboards.nutrition.statusBinhThuong',
  canCaiThien: 'home.dashboards.nutrition.statusCanCaiThien',
};

const STATUS_COLOR: Record<NutritionStatus, string> = {
  tot: COLORS.sleepQualityExcellent,
  binhThuong: COLORS.sleepQualityGood,
  canCaiThien: COLORS.errorText,
};

const NutritionMiniDashboard: React.FC<NutritionMiniDashboardProps> = ({
  waterLiters,
  waterGoal,
  weekScore,
  status,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const cellCount = Math.round(waterGoal / WATER_CELL_LITERS);
  const filledCells = Math.round(waterLiters / WATER_CELL_LITERS);
  const cells = Array.from({ length: cellCount });

  return (
    <Pressable style={styles.card} onPress={() => navigation.navigate('FoodMain')}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={22}
            color={COLORS.foodHeaderOrange}
          />
        </View>
        <View style={styles.headerText}>
          <AppText style={styles.title}>{t('home.dashboards.nutrition.title')}</AppText>
          <AppText style={styles.subtitle}>
            {t('home.dashboards.nutrition.water', {
              liters: waterLiters.toFixed(2),
              goal: waterGoal.toFixed(1),
            })}
          </AppText>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textTertiary} />
      </View>

      <View style={styles.waterRow}>
        {cells.map((_, i) => {
          const isFilled = i < filledCells;
          return (
            <View
              key={i}
              style={[
                styles.waterCell,
                isFilled
                  ? styles.waterCellFilled
                  : styles.waterCellEmpty,
              ]}
            >
              {isFilled && (
                <MaterialCommunityIcons name="water" size={13} color={COLORS.white} />
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statTile}>
          <AppText style={styles.statLabel}>
            {t('home.dashboards.nutrition.weekScore')}
          </AppText>
          <AppText style={styles.statValue}>
            {weekScore.toFixed(1)}
          </AppText>
        </View>
        <View style={styles.statTile}>
          <AppText style={styles.statLabel}>
            {t('home.dashboards.nutrition.status')}
          </AppText>
          <View style={styles.statValueRow}>
            <MaterialCommunityIcons
              name="emoticon-outline"
              size={16}
              color={STATUS_COLOR[status]}
            />
            <AppText style={[styles.statValueText, { color: STATUS_COLOR[status] }]}>
              {t(STATUS_I18N_KEY[status])}
            </AppText>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.foodOrangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  waterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  waterCell: {
    flex: 1,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterCellFilled: {
    backgroundColor: COLORS.foodHeaderOrange,
    borderColor: COLORS.foodHeaderOrange,
  },
  waterCellEmpty: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.borderSubtle,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statTile: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  statValueText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default NutritionMiniDashboard;
