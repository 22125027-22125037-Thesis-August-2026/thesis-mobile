import React, { useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Pressable,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NavigationContext, NavigationProp, ParamListBase } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';

import * as diaryApi from '../../api/diaryApi';
import { COLORS } from '../../constants/colors';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '../../constants/theme';
import { AttachmentFile } from '../../types/media';

type MoodTag = 'TERRIBLE' | 'BAD' | 'NEUTRAL' | 'GOOD' | 'EXCELLENT';

type MoodOption = {
  value: MoodTag;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  activeIcon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
};

const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 'TERRIBLE',
    icon: 'emoticon-cry-outline',
    activeIcon: 'emoticon-cry',
    color: COLORS.journalMoodTerrible,
  },
  {
    value: 'BAD',
    icon: 'emoticon-sad-outline',
    activeIcon: 'emoticon-sad',
    color: COLORS.journalMoodBad,
  },
  {
    value: 'NEUTRAL',
    icon: 'emoticon-neutral-outline',
    activeIcon: 'emoticon-neutral',
    color: COLORS.journalMoodNeutral,
  },
  {
    value: 'GOOD',
    icon: 'emoticon-happy-outline',
    activeIcon: 'emoticon-happy',
    color: COLORS.journalMoodGood,
  },
  {
    value: 'EXCELLENT',
    icon: 'emoticon-excited-outline',
    activeIcon: 'emoticon-excited',
    color: COLORS.journalMoodExcellent,
  },
];

const MOOD_SCORE_MAP: Record<MoodTag, number> = {
  TERRIBLE: 2,
  BAD: 4,
  NEUTRAL: 6,
  GOOD: 8,
  EXCELLENT: 10,
};

const MAX_CONTENT_LENGTH = 300;
const MAX_ATTACHMENTS = 5;

const DiaryEntryScreen: React.FC = () => {
  type PickerAsset = {
    uri?: string;
    fileName?: string;
    type?: string;
  };

  const navigation = useContext(NavigationContext) as
    | NavigationProp<ParamListBase>
    | undefined;
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [moodTag, setMoodTag] = useState<MoodTag>('TERRIBLE');
  const [positivityScore, setPositivityScore] = useState<number>(8);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const canSubmit = useMemo(
    () => content.trim().length > 0 && !isSubmitting,
    [content, isSubmitting],
  );

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
      Alert.alert('Selection limit', 'You can attach up to 5 images.');
      return;
    }

    const availableSlots = MAX_ATTACHMENTS - attachments.length;
    const filesToAppend = mappedFiles.slice(0, availableSlots);

    if (filesToAppend.length < mappedFiles.length) {
      Alert.alert('Selection limit', 'Only the first 5 images were added.');
    }

    setAttachments(previous => [...previous, ...filesToAppend]);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!content.trim()) {
      Alert.alert('Validation', 'Please enter your diary content.');
      return;
    }

    setIsSubmitting(true);
    const mappedScore = MOOD_SCORE_MAP[moodTag];
    setPositivityScore(mappedScore);

    const diaryPayload = {
      title,
      content,
      moodTag,
      positivityScore: mappedScore,
    };
    const imageUris = attachments.map(attachment => attachment.uri);

    try {
      const response = await diaryApi.createDiaryEntry(diaryPayload, imageUris);
      Alert.alert('Success!', `Diary entry ID: ${response.id}`);
      setTitle('');
      setContent('');
      setAttachments([]);
      setMoodTag('TERRIBLE');
      setPositivityScore(8);
    } catch {
      Alert.alert('Error', 'Failed to create diary entry.');
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
                onPress={() => navigation?.goBack()}
                disabled={isSubmitting || !navigation?.canGoBack?.()}>
                <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
              </Pressable>
              <Text style={styles.screenTitle}>Hôm nay bạn thế nào?</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tiêu đề</Text>
              <View style={styles.titleInputContainer}>
                <Feather name="file-text" size={18} color={COLORS.inputIcon} />
                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Lại cảm thấy tồi tệ"
                  placeholderTextColor={COLORS.placeholder}
                  editable={!isSubmitting}
                />
                <Feather name="edit-3" size={18} color={COLORS.inputIcon} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Chọn cảm xúc</Text>
              <View style={styles.moodRow}>
                {MOOD_OPTIONS.map(mood => {
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
              <Text style={styles.sectionLabel}>Bạn đang nghĩ gì? Hãy viết ra đây nhé...</Text>
              <View style={styles.contentCard}>
                <TextInput
                  style={styles.contentInput}
                  multiline
                  value={content}
                  onChangeText={setContent}
                  placeholder="Tôi đang buồn lắm nhưng tôi không muốn làm to chuyện. Tôi không biết bắt đầu từ đâu."
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
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </Pressable>

                  <View style={styles.counterRow}>
                    <Feather name="file-text" size={14} color={COLORS.journalCounter} />
                    <Text style={styles.counterText}>{content.length}/300</Text>
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
                  <Text style={styles.submitText}>Ghi lại cảm xúc</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.journalBackground,
  },
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    rowGap: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.sm,
  },
  headerBackButton: {
    width: 46,
    height: 46,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.journalIconStroke,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.journalBackground,
  },
  screenTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  section: {
    rowGap: SPACING.sm,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  titleInputContainer: {
    minHeight: 56,
    backgroundColor: COLORS.journalPillBackground,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    columnGap: SPACING.sm,
  },
  titleInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodOuter: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodOuterSelected: {
    backgroundColor: COLORS.journalMoodActive,
  },
  moodInner: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCard: {
    borderWidth: 2,
    borderColor: COLORS.journalContentBorder,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.journalPillBackground,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    minHeight: 250,
  },
  contentInput: {
    flex: 1,
    minHeight: 130,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    columnGap: SPACING.xs,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.xs,
  },
  iconPillButton: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.journalToolbarPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  addPhotoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.xs,
  },
  counterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  attachmentsPreviewRow: {
    columnGap: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.borderSubtle,
  },
  submitArea: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  submitButton: {
    backgroundColor: COLORS.buttonPrimary,
    minHeight: 58,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.sm,
  },
  submitText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.buttonPrimaryText,
  },
});

export default DiaryEntryScreen;
