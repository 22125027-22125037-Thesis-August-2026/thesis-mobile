import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Pressable,
  Platform,
  ScrollView,
  TextInput,
  View,
  Modal,
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';

import { diaryApi } from '@/api';
import { AuthContext } from '@/context/AuthContext';
import {
  MOOD_SELECTOR_OPTIONS,
  MoodTag,
  getMoodScore,
  getMoodTag,
} from '@/constants';
import { COLORS, FONTS } from '@/theme';
import { TrackingStackParamList } from '@/navigation';
import { AttachmentFile } from '@/types';
import { styles } from '@/screens/tracking/diary/DiaryEntryScreen.styles';

const MAX_CONTENT_LENGTH = 500;
const MAX_ATTACHMENTS = 5;

const DiaryEntryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useContext(AuthContext)!;
  type PickerAsset = {
    uri?: string;
    fileName?: string;
    type?: string;
  };

  const route = useRoute<RouteProp<TrackingStackParamList, 'DiaryEntry'>>();
  const entryId = route.params?.entryId;
  const navigation = useContext(NavigationContext) as
    | NavigationProp<TrackingStackParamList>
    | undefined;
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [moodTag, setMoodTag] = useState<MoodTag>('TERRIBLE');
  const [positivityScore, setPositivityScore] = useState<number>(8);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingEntry, setIsLoadingEntry] = useState<boolean>(false);
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const canSubmit = useMemo(
    () => content.trim().length > 0 && !isSubmitting && !isLoadingEntry,
    [content, isSubmitting, isLoadingEntry],
  );

  useEffect(() => {
    let isMounted = true;

    const hydrateEntry = async (): Promise<void> => {
      if (!entryId) {
        return;
      }

      setIsLoadingEntry(true);

      try {
        const entry = await diaryApi.getDiaryEntryById(userInfo?.profileId ?? '', entryId);

        if (!isMounted) {
          return;
        }

        setTitle(entry.title ?? '');
        setContent(entry.content ?? '');

        const resolvedMood = getMoodTag(entry.moodTag);
        setMoodTag(resolvedMood);
        setPositivityScore(getMoodScore(resolvedMood));

        // Initialize entryDate from the entry or default to today
        if (entry.entryDate) {
          setEntryDate(new Date(entry.entryDate));
        } else {
          setEntryDate(new Date());
        }

        const mappedAttachments: AttachmentFile[] = (
          entry.attachments ?? []
        ).map(attachment => ({
          uri: attachment.fileUrl,
          name: attachment.fileName,
          type: 'image/jpeg',
        }));

        setAttachments(mappedAttachments);
      } catch (error) {
        console.error('[DiaryEntry] Failed to fetch entry detail:', error);
      } finally {
        if (isMounted) {
          setIsLoadingEntry(false);
        }
      }
    };

    hydrateEntry();

    return () => {
      isMounted = false;
    };
  }, [entryId]);

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
      .filter(asset => typeof asset.uri === 'string' && asset.uri.length > 0)
      .map((asset, index) => ({
        uri: asset.uri as string,
        name:
          asset.fileName && asset.fileName.length > 0
            ? asset.fileName
            : `attachment-${Date.now()}-${index}.jpg`,
        type: asset.type && asset.type.length > 0 ? asset.type : 'image/jpeg',
      }));

    if (mappedFiles.length === 0) {
      return;
    }

    if (attachments.length >= MAX_ATTACHMENTS) {
      Alert.alert(
        t('entry.selectionLimitTitle'),
        t('entry.selectionLimitMessage'),
      );
      return;
    }

    const availableSlots = MAX_ATTACHMENTS - attachments.length;
    const filesToAppend = mappedFiles.slice(0, availableSlots);

    if (filesToAppend.length < mappedFiles.length) {
      Alert.alert(
        t('entry.selectionLimitTitle'),
        t('entry.selectionLimitTruncatedMessage'),
      );
    }

    setAttachments(previous => [...previous, ...filesToAppend]);
  };

  const handleDateChange = (event: any, selectedDate?: Date): void => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      // Disable future dates
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

    // For Vietnamese, format as "Ngày 15 tháng 4, 2026"
    const locale =
      t('entry.dateFormat') === '{{day}}/{{month}}/{{year}}' ? 'en' : 'vi';

    if (locale === 'vi') {
      return `Ngày ${day} tháng ${month}, ${year}`;
    } else {
      return `${day}/${month}/${year}`;
    }
  };

  const formatDateForAPI = (): string => {
    const day = String(entryDate.getDate()).padStart(2, '0');
    const month = String(entryDate.getMonth() + 1).padStart(2, '0');
    const year = entryDate.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!content.trim()) {
      Alert.alert(
        t('entry.validationTitle'),
        t('entry.validationContentRequired'),
      );
      return;
    }

    setIsSubmitting(true);
    const mappedScore = getMoodScore(moodTag);
    setPositivityScore(mappedScore);

    const diaryPayload = {
      title,
      content,
      moodTag,
      positivityScore: mappedScore,
      entryDate: formatDateForAPI(),
    };
    const imageUris = attachments.map(attachment => attachment.uri);
    console.log(
      'Submitting diary entry with payload:',
      diaryPayload,
      'and images:',
      imageUris,
    );

    try {
      const response = entryId
        ? await diaryApi.updateDiaryEntry(entryId, diaryPayload, imageUris)
        : await diaryApi.createDiaryEntry(diaryPayload, imageUris);

      Alert.alert(
        t('entry.successTitle'),
        t('entry.successDiaryId', { id: response.id }),
      );
      setTitle('');
      setContent('');
      setAttachments([]);
      setMoodTag('TERRIBLE');
      setPositivityScore(8);
      setEntryDate(new Date());
      navigation?.navigate('DiaryOverview');
    } catch {
      Alert.alert(t('entry.errorTitle'), t('entry.errorCreateDiary'));
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
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <Pressable
                style={styles.headerBackButton}
                onPress={() => navigation?.navigate('DiaryOverview')}
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

            <View style={styles.section}>
              <AppText style={styles.sectionLabel}>
                {t('entry.moodLabel')}
              </AppText>
              <View style={styles.moodRow}>
                {MOOD_SELECTOR_OPTIONS.map(mood => {
                  const isSelected = mood.value === moodTag;

                  return (
                    <Pressable
                      key={mood.value}
                      style={[
                        styles.moodOuter,
                        isSelected && styles.moodOuterSelected,
                      ]}
                      onPress={() => setMoodTag(mood.value)}
                      disabled={isSubmitting}
                    >
                      <View
                        style={[
                          styles.moodInner,
                          { backgroundColor: mood.color },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={isSelected ? mood.activeIcon : mood.icon}
                          size={28}
                          color={COLORS.journalMoodFace}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Date Picker Section */}
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

            {/* Date Picker Modal */}
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

            <View style={styles.section}>
              <AppText style={styles.sectionLabel}>
                {t('entry.contentLabel')}
              </AppText>
              <View style={styles.contentCard}>
                <TextInput
                  style={[styles.contentInput, { fontFamily: FONTS.regular }]}
                  multiline
                  value={content}
                  onChangeText={setContent}
                  placeholder={t('entry.contentPlaceholder')}
                  placeholderTextColor={COLORS.placeholder}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                  maxLength={MAX_CONTENT_LENGTH}
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

                  <View style={styles.counterRow}>
                    <Feather
                      name="file-text"
                      size={14}
                      color={COLORS.journalCounter}
                    />
                    <AppText style={styles.counterText}>
                      {t('entry.counter', { count: content.length })}
                    </AppText>
                  </View>
                </View>

                {attachments.length > 0 ? (
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
                ) : null}
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
    </SafeAreaView>
  );
};

export default DiaryEntryScreen;
