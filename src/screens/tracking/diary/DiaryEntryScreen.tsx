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
  Text,
  TextInput,
  View,
} from 'react-native';
import { NavigationContext, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';

import * as diaryApi from '../../../api/diaryApi';
import { COLORS } from '../../../constants/colors';
import { t } from '../../../constants/i18n';
import { MOOD_SELECTOR_OPTIONS, MoodTag, getMoodScore, getMoodTag } from '../../../constants/moods';
import { TrackingStackParamList } from '../../../navigation/types';
import { AttachmentFile } from '../../../types/media';
import { styles } from './DiaryEntryScreen.styles';

const MAX_CONTENT_LENGTH = 300;
const MAX_ATTACHMENTS = 5;

const DiaryEntryScreen: React.FC = () => {
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
        const entry = await diaryApi.getDiaryEntryById(entryId);

        if (!isMounted) {
          return;
        }

        setTitle(entry.title ?? '');
        setContent(entry.content ?? '');

        const resolvedMood = getMoodTag(entry.moodTag);
        setMoodTag(resolvedMood);
        setPositivityScore(getMoodScore(resolvedMood));

        const mappedAttachments: AttachmentFile[] = (entry.attachments ?? []).map(
          attachment => ({
            uri: attachment.fileUrl,
            name: attachment.fileName,
            type: 'image/jpeg',
          }),
        );

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

    if (response.didCancel || !response.assets || response.assets.length === 0) {
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
      Alert.alert(t('entry.selectionLimitTitle'), t('entry.selectionLimitMessage'));
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

  const handleSubmit = async (): Promise<void> => {
    if (!content.trim()) {
      Alert.alert(t('entry.validationTitle'), t('entry.validationContentRequired'));
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
    };
    const imageUris = attachments.map(attachment => attachment.uri);

    try {
      const response = entryId
        ? await diaryApi.updateDiaryEntry(entryId, diaryPayload, imageUris)
        : await diaryApi.createDiaryEntry(diaryPayload, imageUris);

      Alert.alert(t('entry.successTitle'), t('entry.successDiaryId', { id: response.id }));
      setTitle('');
      setContent('');
      setAttachments([]);
      setMoodTag('TERRIBLE');
      setPositivityScore(8);
      navigation?.navigate('DiaryDashboard');
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.screen}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Pressable
                style={styles.headerBackButton}
                onPress={() => navigation?.navigate('DiaryDashboard')}
                disabled={isSubmitting || isLoadingEntry}>
                <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
              </Pressable>
              <Text style={styles.screenTitle}>
                {entryId ? t('entry.editTitle') : t('entry.screenTitle')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('entry.titleLabel')}</Text>
              <View style={styles.titleInputContainer}>
                <Feather name="file-text" size={18} color={COLORS.inputIcon} />
                <TextInput
                  style={styles.titleInput}
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
              <Text style={styles.sectionLabel}>{t('entry.moodLabel')}</Text>
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
                      disabled={isSubmitting}>
                      <View
                        style={[
                          styles.moodInner,
                          { backgroundColor: mood.color },
                        ]}>
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

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('entry.contentLabel')}</Text>
              <View style={styles.contentCard}>
                <TextInput
                  style={styles.contentInput}
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
                  <View style={styles.toolbarLeft}>
                    <Pressable style={styles.iconPillButton} onPress={() => {}}>
                      <Ionicons name="arrow-undo" size={18} color={COLORS.textPrimary} />
                    </Pressable>
                    <Pressable style={styles.iconPillButton} onPress={() => {}}>
                      <Ionicons name="arrow-redo" size={18} color={COLORS.textPrimary} />
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.addPhotoButton}
                    onPress={handlePickImage}
                    disabled={isSubmitting}>
                    <Feather name="camera" size={16} color={COLORS.journalCounter} />
                    <Text style={styles.addPhotoText}>{t('entry.addPhoto')}</Text>
                  </Pressable>

                  <View style={styles.counterRow}>
                    <Feather name="file-text" size={14} color={COLORS.journalCounter} />
                    <Text style={styles.counterText}>{t('entry.counter', { count: content.length })}</Text>
                  </View>
                </View>

                {attachments.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.attachmentsPreviewRow}>
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
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}>
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.buttonPrimaryText} />
              ) : (
                <View style={styles.submitContent}>
                  <Text style={styles.submitText}>{t('entry.submitButton')}</Text>
                  <Feather name="check" size={20} color={COLORS.buttonPrimaryText} />
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
