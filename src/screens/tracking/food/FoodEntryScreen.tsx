import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { foodApi } from '@/api';
import { COLORS, FONTS } from '@/theme';
import { FoodLogRequest } from '@/types';
import { styles } from '@/screens/tracking/food/FoodEntryScreen.styles';

type MealTypeOption = {
  labelKey: string;
  value: string;
};

type SatietyLevelOption = {
  value: number;
  level: string;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  color: string;
};

const MEAL_TYPES: MealTypeOption[] = [
  { labelKey: 'food.meal.breakfast', value: 'BREAKFAST' },
  { labelKey: 'food.meal.lunch', value: 'LUNCH' },
  { labelKey: 'food.meal.dinner', value: 'DINNER' },
  { labelKey: 'food.meal.snack', value: 'SNACK' },
];

const SATIETY_LEVELS: SatietyLevelOption[] = [
  {
    value: 5,
    level: 'ENERGIZED',
    titleKey: 'food.satiety.energized',
    subtitleKey: 'food.satietySubtitle.energized',
    icon: 'emoticon-happy-outline',
    color: '#84CC16',
  },
  {
    value: 4,
    level: 'NORMAL',
    titleKey: 'food.satiety.normal',
    subtitleKey: 'food.satietySubtitle.normal',
    icon: 'emoticon-outline',
    color: '#FACC15',
  },
  {
    value: 3,
    level: 'INDULGENT',
    titleKey: 'food.satiety.indulgent',
    subtitleKey: 'food.satietySubtitle.indulgent',
    icon: 'emoticon-neutral-outline',
    color: '#A8A29E',
  },
  {
    value: 2,
    level: 'OVERATE',
    titleKey: 'food.satiety.overate',
    subtitleKey: 'food.satietySubtitle.overate',
    icon: 'emoticon-sad-outline',
    color: '#FB923C',
  },
  {
    value: 1,
    level: 'SKIPPED',
    titleKey: 'food.satiety.skipped',
    subtitleKey: 'food.satietySubtitle.skipped',
    icon: 'emoticon-cry-outline',
    color: '#A855F7',
  },
];

const MAX_DESCRIPTION_LENGTH = 300;

const FoodEntryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { t } = useTranslation();

  const [mealType, setMealType] = useState<string>('LUNCH');
  const [satietyLevel, setSatietyLevel] = useState<number>(4);
  const [foodDescription, setFoodDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const canSubmit = useMemo(
    () => foodDescription.trim().length > 0 && !isSubmitting,
    [foodDescription, isSubmitting],
  );

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    const satietyLevelValue = SATIETY_LEVELS.find(
      level => level.value === satietyLevel,
    )?.level;

    const payload: FoodLogRequest = {
      mealType,
      foodDescription: foodDescription.trim(),
      satietyLevel: satietyLevelValue || 'NORMAL',
    };

    try {
      await foodApi.createFoodLog(payload);
      Alert.alert(t('food.entry.successTitle'), t('food.entry.successMessage'));
      navigation.goBack();
    } catch {
      Alert.alert(t('food.entry.errorTitle'), t('food.entry.errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.screen}>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <Pressable style={styles.backButton} onPress={navigation.goBack}>
                <Feather
                  name="arrow-left"
                  size={20}
                  color={COLORS.textPrimary}
                />
              </Pressable>
              <AppText style={styles.headerLabel}>
                {t('food.entry.screenTitle')}
              </AppText>
            </View>

            <AppText style={styles.title}>
              {t('food.entry.mainQuestion')}
            </AppText>

            <View style={styles.mealTypesSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mealTypesContainer}
              >
                {MEAL_TYPES.map(meal => {
                  const isSelected = mealType === meal.value;

                  return (
                    <TouchableOpacity
                      key={meal.value}
                      style={[
                        styles.mealTypeChip,
                        isSelected && styles.mealTypeChipSelected,
                      ]}
                      onPress={() => setMealType(meal.value)}
                      activeOpacity={0.85}
                    >
                      <AppText
                        style={[
                          styles.mealTypeText,
                          isSelected && styles.mealTypeTextSelected,
                        ]}
                      >
                        {t(meal.labelKey)}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.selectorSection}>
              {SATIETY_LEVELS.map(option => {
                const isSelected = satietyLevel === option.value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.satietyRow,
                      isSelected && styles.satietyRowSelected,
                    ]}
                    onPress={() => setSatietyLevel(option.value)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.satietyTextBlock}>
                      <AppText style={styles.satietyTitle}>
                        {t(option.titleKey)}
                      </AppText>
                      <AppText style={styles.satietySubtitle}>
                        {t(option.subtitleKey)}
                      </AppText>
                    </View>

                    <View style={styles.timelineHolder}>
                      <View style={styles.timelineTrack}>
                        {isSelected ? (
                          <View
                            style={[
                              styles.timelineKnob,
                              { backgroundColor: option.color },
                            ]}
                          />
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.iconHolder}>
                      <MaterialCommunityIcons
                        name={option.icon}
                        size={26}
                        color={option.color}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View>
              <AppText style={styles.sectionTitle}>
                {t('food.entry.descriptionLabel')}
              </AppText>
              <View style={styles.descriptionCard}>
                <TextInput
                  style={[
                    styles.descriptionInput,
                    { fontFamily: FONTS.regular },
                  ]}
                  placeholder={t('food.entry.descriptionPlaceholder')}
                  placeholderTextColor={COLORS.placeholder}
                  multiline
                  value={foodDescription}
                  onChangeText={setFoodDescription}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                />
                <View style={styles.descriptionFooter}>
                  <View style={styles.toolbarButtons}>
                    <Pressable style={styles.toolbarButton}>
                      <Feather
                        name="rotate-ccw"
                        size={18}
                        color={COLORS.textSecondary}
                      />
                    </Pressable>
                    <Pressable style={styles.toolbarButton}>
                      <Feather
                        name="rotate-cw"
                        size={18}
                        color={COLORS.textSecondary}
                      />
                    </Pressable>
                    <Pressable style={styles.toolbarButton}>
                      <MaterialCommunityIcons
                        name="camera"
                        size={18}
                        color={COLORS.textSecondary}
                      />
                    </Pressable>
                  </View>
                  <AppText style={styles.characterCounter}>
                    {t('food.entry.counter', { count: foodDescription.length })}
                  </AppText>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.submitButton,
              !canSubmit && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator
                size="small"
                color={COLORS.buttonPrimaryText}
              />
            ) : (
              <View style={styles.submitContent}>
                <AppText style={styles.submitText}>
                  {t('food.entry.submitButton')}
                </AppText>
                <Feather
                  name="check"
                  size={20}
                  color={COLORS.buttonPrimaryText}
                />
              </View>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FoodEntryScreen;
