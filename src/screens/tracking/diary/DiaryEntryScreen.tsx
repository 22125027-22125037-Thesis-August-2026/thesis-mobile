import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';
import { AppText } from '@/components';
import {
  NavigationContext,
  NavigationProp,
  RouteProp,
  useRoute,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';

import { diaryApi } from '@/api';
import { TrackingCelebrationSheet } from '@/components';
import { AuthContext } from '@/context/AuthContext';
import {
  ALL_DIARY_TAGS,
  DIARY_TAG_CATEGORIES,
  PlutchikEmotion,
  PLUTCHIK_EMOTION_LIST,
  PLUTCHIK_EMOTIONS,
  getEmotionFromMoodTag,
  getMoodTag,
} from '@/constants';
import { COLORS, FONTS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import { AttachmentFile } from '@/types';
import { WidgetBridge } from '@/native/WidgetBridge';
import {
  CelebrationStatus,
  markCategoryLogged,
  playSoftHaptic,
} from '@/utils';
import { styles } from '@/screens/tracking/diary/DiaryEntryScreen.styles';
import TagSelector from './TagSelector';

const MAX_QUICK_NOTE_LENGTH = 100;
const MAX_ATTACHMENTS = 5;

// Emotion grid layout: 2 rows × 4 columns (Plutchik order)
const EMOTION_ROWS = [
  PLUTCHIK_EMOTION_LIST.slice(0, 4), // JOY, TRUST, ANTICIPATION, SURPRISE
  PLUTCHIK_EMOTION_LIST.slice(4, 8), // FEAR, SADNESS, DISGUST, ANGER
];

// Background palette — soft tinted washes matching each Plutchik color
const EMOTION_BACKGROUNDS: Record<PlutchikEmotion, string> = {
  JOY:          '#FFFDE7',
  TRUST:        '#E8F5E9',
  ANTICIPATION: '#FBE9E7',
  SURPRISE:     '#FFF8E1',
  FEAR:         '#E0F2F1',
  SADNESS:      '#E3F2FD',
  DISGUST:      '#F3E5F5',
  ANGER:        '#FFEBEE',
};


const parseContent = (raw: string): { tags: string[]; note: string } => {
  const full = raw.match(/^Tags: (.*?) \| Note: ([\s\S]*)$/);
  if (full) {
    return { tags: full[1].split(', ').filter(Boolean), note: full[2] };
  }
  const tagsOnly = raw.match(/^Tags: (.*)$/);
  if (tagsOnly) {
    return { tags: tagsOnly[1].split(', ').filter(Boolean), note: '' };
  }
  return { tags: [], note: raw };
};

const DiaryEntryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useContext(AuthContext)!;
  type PickerAsset = { uri?: string; fileName?: string; type?: string };

  const route = useRoute<RouteProp<RootStackParamList, 'DiaryEntry'>>();
  const entryId = route.params?.entryId;
  const navigation = useContext(NavigationContext) as
    | NavigationProp<RootStackParamList>
    | undefined;

  const [title, setTitle] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<PlutchikEmotion>('JOY');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [quickNote, setQuickNote] = useState<string>('');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingEntry, setIsLoadingEntry] = useState<boolean>(false);
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Cross-fade: two stacked Views, animate opacity of incoming layer.
  // useNativeDriver:true → runs on UI thread, no JS-bridge color sweep.
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const currentBgRef = useRef(EMOTION_BACKGROUNDS.JOY);
  const [prevBgColor, setPrevBgColor] = useState(EMOTION_BACKGROUNDS.JOY);
  const [currentBgColor, setCurrentBgColor] = useState(EMOTION_BACKGROUNDS.JOY);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStatus, setCelebrationStatus] = useState<CelebrationStatus>({
    count: 0, diary: false, nutrition: false, sleep: false, steps: false,
  });

  useEffect(() => {
    const nextColor = EMOTION_BACKGROUNDS[selectedEmotion];
    if (nextColor === currentBgRef.current) return;

    const fromColor = currentBgRef.current;
    currentBgRef.current = nextColor;

    setPrevBgColor(fromColor);
    setCurrentBgColor(nextColor);
    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [selectedEmotion]);

  const canSubmit = useMemo(
    () => !isSubmitting && !isLoadingEntry,
    [isSubmitting, isLoadingEntry],
  );

  useEffect(() => {
    let isMounted = true;

    const hydrateEntry = async (): Promise<void> => {
      if (!entryId) return;
      setIsLoadingEntry(true);

      try {
        const entry = await diaryApi.getDiaryEntryById(
          userInfo?.profileId ?? '',
          entryId,
        );
        if (!isMounted) return;

        setTitle(entry.title ?? '');

        const resolvedMoodTag = getMoodTag(entry.moodTag);
        setSelectedEmotion(getEmotionFromMoodTag(resolvedMoodTag));

        if (entry.entryDate) {
          setEntryDate(new Date(entry.entryDate));
        }

        const { tags, note } = parseContent(entry.content ?? '');
        setSelectedTags(tags.filter(tag => ALL_DIARY_TAGS.includes(tag)));
        setQuickNote(note);

        const mappedAttachments: AttachmentFile[] = (entry.attachments ?? []).map(
          a => ({ uri: a.fileUrl, name: a.fileName, type: 'image/jpeg' }),
        );
        setAttachments(mappedAttachments);
      } catch (error) {
        console.error('[DiaryEntry] Failed to fetch entry detail:', error);
      } finally {
        if (isMounted) setIsLoadingEntry(false);
      }
    };

    hydrateEntry();
    return () => {
      isMounted = false;
    };
  }, [entryId]);

  const handleToggleTag = (tag: string): void => {
    playSoftHaptic();
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

  const handlePickImage = async (): Promise<void> => {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 0,
      quality: 0.8,
    });

    if (
      response.didCancel ||
      !response.assets ||
      response.assets.length === 0
    ) {
      return;
    }

    const pickerAssets = response.assets as PickerAsset[];
    const mappedFiles: AttachmentFile[] = pickerAssets
      .filter(a => typeof a.uri === 'string' && a.uri.length > 0)
      .map((a, i) => ({
        uri: a.uri as string,
        name:
          a.fileName && a.fileName.length > 0
            ? a.fileName
            : `attachment-${Date.now()}-${i}.jpg`,
        type: a.type && a.type.length > 0 ? a.type : 'image/jpeg',
      }));

    if (mappedFiles.length === 0) return;

    if (attachments.length >= MAX_ATTACHMENTS) {
      Alert.alert(
        t('entry.selectionLimitTitle'),
        t('entry.selectionLimitMessage'),
      );
      return;
    }

    const available = MAX_ATTACHMENTS - attachments.length;
    const toAppend = mappedFiles.slice(0, available);

    if (toAppend.length < mappedFiles.length) {
      Alert.alert(
        t('entry.selectionLimitTitle'),
        t('entry.selectionLimitTruncatedMessage'),
      );
    }

    setAttachments(prev => [...prev, ...toAppend]);
  };

  const handleDateChange = (event: any, selectedDate?: Date): void => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      if (selectedDate > new Date()) {
        Alert.alert(
          t('entry.validationTitle'),
          'Bạn không thể chọn ngày trong tương lai',
        );
        return;
      }
      setEntryDate(selectedDate);
    }
  };

  const formatEntryDate = (): string => {
    const day = entryDate.getDate();
    const month = entryDate.getMonth() + 1;
    const year = entryDate.getFullYear();
    const isVietnamese =
      t('entry.dateFormat') !== '{{day}}/{{month}}/{{year}}';
    return isVietnamese
      ? `Ngày ${day} tháng ${month}, ${year}`
      : `${day}/${month}/${year}`;
  };

  const formatDateForAPI = (): string => {
    const day = String(entryDate.getDate()).padStart(2, '0');
    const month = String(entryDate.getMonth() + 1).padStart(2, '0');
    const year = entryDate.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const buildContent = (): string => {
    const parts: string[] = [];
    if (selectedTags.length > 0) {
      parts.push(`Tags: ${selectedTags.join(', ')}`);
    }
    if (quickNote.trim()) {
      parts.push(`Note: ${quickNote.trim()}`);
    }
    return parts.join(' | ');
  };

  const handleSubmit = async (): Promise<void> => {
    playSoftHaptic();
    setIsSubmitting(true);

    const emotion = PLUTCHIK_EMOTIONS[selectedEmotion];
    const diaryPayload = {
      title,
      content: buildContent(),
      moodTag: emotion.moodTag,
      positivityScore: emotion.score,
      entryDate: formatDateForAPI(),
    };
    const imageUris = attachments.map(a => a.uri);

    try {
      await (entryId
        ? diaryApi.updateDiaryEntry(entryId, diaryPayload, imageUris)
        : diaryApi.createDiaryEntry(diaryPayload, imageUris));

      void WidgetBridge.cacheLastMood(emotion.moodTag, new Date().toISOString());
      void WidgetBridge.requestRefresh();

      setTitle('');
      setSelectedEmotion('JOY');
      setSelectedTags([]);
      setQuickNote('');
      setAttachments([]);
      setEntryDate(new Date());

      // Show celebration sheet; navigate back after it closes
      setCelebrationStatus(markCategoryLogged('diary'));
      setShowCelebration(true);
    } catch {
      Alert.alert(t('entry.errorTitle'), t('entry.errorCreateDiary'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.rootContainer}>
      {/* Layer 1 — outgoing colour (solid, no animation) */}
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: prevBgColor }]}
        pointerEvents="none"
      />
      {/* Layer 2 — incoming colour (fades in via opacity, native driver) */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: currentBgColor, opacity: fadeAnim }]}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.screen}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <Pressable
                style={styles.headerBackButton}
                onPress={() => navigation?.goBack()}
                disabled={isSubmitting || isLoadingEntry}
              >
                <Feather
                  name="arrow-left"
                  size={20}
                  color={COLORS.textPrimary}
                />
              </Pressable>
              <AppText style={styles.screenTitle}>
                {entryId ? t('entry.editTitle') : t('entry.screenTitle')}
              </AppText>
            </View>

            {/* Emotion Grid */}
            <View style={styles.section}>
              <AppText style={styles.sectionLabel}>
                {t('entry.moodLabel')}
              </AppText>
              {isLoadingEntry ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <View style={styles.emotionGrid}>
                  {EMOTION_ROWS.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.emotionRow}>
                      {row.map(emotion => {
                        const isSelected = emotion.key === selectedEmotion;
                        return (
                          <Pressable
                            key={emotion.key}
                            style={[
                              styles.emotionCell,
                              isSelected && styles.emotionCellSelected,
                            ]}
                            onPress={() => {
                              playSoftHaptic();
                              setSelectedEmotion(emotion.key);
                            }}
                            disabled={isSubmitting}
                          >
                            <View
                              style={[
                                styles.emotionCircle,
                                { backgroundColor: emotion.color },
                                isSelected && styles.emotionCircleSelected,
                              ]}
                            >
                              <MaterialCommunityIcons
                                name={
                                  isSelected
                                    ? emotion.activeIcon
                                    : emotion.icon
                                }
                                size={26}
                                color={COLORS.journalMoodFace}
                              />
                            </View>
                            <AppText
                              style={[
                                styles.emotionLabel,
                                isSelected && styles.emotionLabelSelected,
                              ]}
                              numberOfLines={1}
                            >
                              {emotion.label}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Date Picker */}
            <View style={styles.section}>
              <AppText style={styles.sectionLabel}>
                {t('entry.dateLabel')}
              </AppText>
              <Pressable
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
                disabled={isSubmitting || isLoadingEntry}
              >
                <Feather name="calendar" size={18} color={COLORS.primary} />
                <AppText style={styles.datePickerText}>
                  {formatEntryDate()}
                </AppText>
              </Pressable>
            </View>

            {showDatePicker &&
              (Platform.OS === 'ios' ? (
                <Modal
                  transparent
                  animationType="slide"
                  visible={showDatePicker}
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.datePickerModal}>
                    <View style={styles.datePickerContainer}>
                      <View style={styles.datePickerHeader}>
                        <Pressable onPress={() => setShowDatePicker(false)}>
                          <AppText style={styles.datePickerHeaderText}>
                            {t('entry.selectDate')}
                          </AppText>
                        </Pressable>
                      </View>
                      <DatePicker
                        value={entryDate}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                      <Pressable
                        style={styles.datePickerConfirmButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <AppText style={styles.datePickerConfirmText}>
                          {t('auth.common.notificationTitle')}
                        </AppText>
                      </Pressable>
                    </View>
                  </View>
                </Modal>
              ) : (
                <DatePicker
                  value={entryDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              ))}

            {/* Title */}
            <View style={styles.section}>
              <AppText style={styles.sectionLabel}>
                {t('entry.titleLabel')}
              </AppText>
              <View style={styles.titleInputContainer}>
                <Feather name="file-text" size={18} color={COLORS.inputIcon} />
                <TextInput
                  style={[styles.titleInput, { fontFamily: FONTS.regular }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t('entry.titlePlaceholder')}
                  placeholderTextColor={COLORS.placeholder}
                  editable={!isSubmitting}
                />
                <Feather name="edit-3" size={18} color={COLORS.inputIcon} />
              </View>
            </View>

            {/* Tag Categories */}
            <View style={styles.section}>
              <AppText style={styles.sectionLabel}>
                Hôm nay của bạn
              </AppText>
              <View style={styles.tagCard}>
                {DIARY_TAG_CATEGORIES.map((category, idx) => (
                  <React.Fragment key={category.id}>
                    {idx > 0 && <View style={styles.categorySeparator} />}
                    <View style={styles.categorySection}>
                      <View style={styles.categoryHeader}>
                        <MaterialCommunityIcons
                          name={category.icon}
                          size={14}
                          color={COLORS.primary}
                        />
                        <AppText style={styles.categoryLabel}>
                          {category.label}
                        </AppText>
                      </View>
                      <TagSelector
                        tags={category.tags}
                        selected={selectedTags}
                        onToggle={handleToggleTag}
                        disabled={isSubmitting}
                      />
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Quick Note — tuỳ chọn, tối giản */}
            <View style={styles.section}>
              <AppText style={styles.sectionLabel}>
                Thêm ghi chú{' '}
                <AppText style={styles.categoryLabel}>(tuỳ chọn)</AppText>
              </AppText>
              <View style={styles.quickNoteCard}>
                <TextInput
                  style={[styles.quickNoteInput, { fontFamily: FONTS.regular }]}
                  multiline
                  value={quickNote}
                  onChangeText={setQuickNote}
                  placeholder="Một vài từ về hôm nay..."
                  placeholderTextColor={COLORS.placeholder}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                  maxLength={MAX_QUICK_NOTE_LENGTH}
                />
                <View style={styles.toolbarRow}>
                  <Pressable
                    style={styles.addPhotoButton}
                    onPress={handlePickImage}
                    disabled={isSubmitting}
                  >
                    <Feather
                      name="camera"
                      size={16}
                      color={COLORS.journalCounter}
                    />
                    <AppText style={styles.addPhotoText}>
                      {t('entry.addPhoto')}
                    </AppText>
                  </Pressable>
                  <AppText style={styles.counterText}>
                    {quickNote.length}/{MAX_QUICK_NOTE_LENGTH}
                  </AppText>
                </View>
                {attachments.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.attachmentsPreviewRow}
                  >
                    {attachments.map((file, index) => (
                      <Image
                        key={`${file.name}-${index}`}
                        source={{ uri: file.uri }}
                        style={styles.previewImage}
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.submitArea}>
            <Pressable
              style={[
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.buttonPrimaryText} />
              ) : (
                <View style={styles.submitContent}>
                  <AppText style={styles.submitText}>
                    {t('entry.submitButton')}
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
        </View>
      </KeyboardAvoidingView>
      <TrackingCelebrationSheet
        visible={showCelebration}
        status={celebrationStatus}
        onClose={() => {
          setShowCelebration(false);
          navigation?.goBack();
        }}
      />
    </SafeAreaView>
    </View>
  );
};

export default DiaryEntryScreen;
