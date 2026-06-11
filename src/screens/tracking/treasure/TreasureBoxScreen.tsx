import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';

import { AppText } from '@/components';
import { treasureApi } from '@/api';
import { RootStackParamList } from '@/navigation';
import {
  TREASURE_CATEGORIES,
  TREASURE_EMOJI_CHOICES,
  getTreasureCategory,
} from '@/constants/treasures';
import {
  cacheTreasures,
  loadCachedTreasures,
  pickRandomTreasure,
} from '@/utils/treasureStore';
import type {
  AttachmentFile,
  Treasure,
  TreasureCategoryId,
  TreasureMediaType,
} from '@/types';
import { COLORS } from '@/theme';
import { styles } from './TreasureBoxScreen.styles';
import TreasureMediaViewer from './TreasureMediaViewer';

type Nav = NavigationProp<RootStackParamList>;
type Filter = TreasureCategoryId | 'all';
type PickerAsset = {
  uri?: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
};
type MediaViewerState = {
  url: string;
  type: TreasureMediaType;
  emoji: string;
} | null;

// Backend caps media at 25MB / request at 30MB; keep the picked file comfortably
// under the file limit so uploads don't bounce.
const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

const mediaActionLabel = (type: TreasureMediaType): string =>
  type === 'AUDIO' ? 'Nghe đoạn ghi âm' : 'Xem video';

const TreasureBoxScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Add modal state
  const [addVisible, setAddVisible] = useState(false);
  const [draftCategory, setDraftCategory] = useState<TreasureCategoryId>('reasons');
  const [draftEmoji, setDraftEmoji] = useState('🌅');
  const [draftContent, setDraftContent] = useState('');
  const [draftMedia, setDraftMedia] = useState<AttachmentFile | null>(null);
  const [saving, setSaving] = useState(false);

  // Comfort ("Xoa dịu tôi") overlay state
  const [comfortTreasure, setComfortTreasure] = useState<Treasure | null>(null);
  const comfortAnim = useRef(new Animated.Value(0)).current;

  // Full-screen media viewer
  const [mediaViewer, setMediaViewer] = useState<MediaViewerState>(null);

  const load = useCallback(async (): Promise<void> => {
    try {
      setError(false);
      const data = await treasureApi.getTreasures();
      setTreasures(data);
      void cacheTreasures(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      // Paint the cached list instantly, then refresh from the server. The
      // server response (with fresh presigned URLs) always replaces the cache.
      void loadCachedTreasures().then(cached => {
        if (active && cached.length > 0) {
          setTreasures(prev => (prev.length > 0 ? prev : cached));
        }
      });
      void load();
      return () => {
        active = false;
      };
    }, [load]),
  );

  const visible =
    filter === 'all'
      ? treasures
      : treasures.filter(item => item.category === filter);

  const openMediaViewer = useCallback((treasure: Treasure) => {
    if (!treasure.mediaUrl || !treasure.mediaType) {
      return;
    }
    setMediaViewer({
      url: treasure.mediaUrl,
      type: treasure.mediaType,
      emoji: treasure.emoji,
    });
  }, []);

  const openComfort = useCallback(() => {
    const random = pickRandomTreasure(treasures);
    if (!random) {
      setAddVisible(true);
      return;
    }
    setComfortTreasure(random);
    comfortAnim.setValue(0);
    Animated.timing(comfortAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [treasures, comfortAnim]);

  const closeComfort = useCallback(() => {
    Animated.timing(comfortAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setComfortTreasure(null));
  }, [comfortAnim]);

  const shuffleComfort = useCallback(() => {
    const random = pickRandomTreasure(treasures);
    if (random) {
      setComfortTreasure(random);
    }
  }, [treasures]);

  const resetDraft = (): void => {
    setDraftCategory('reasons');
    setDraftEmoji('🌅');
    setDraftContent('');
    setDraftMedia(null);
  };

  const handlePickPhoto = async (): Promise<void> => {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    if (response.didCancel || !response.assets || response.assets.length === 0) {
      return;
    }

    const asset = response.assets[0] as PickerAsset;
    if (!asset.uri) {
      return;
    }

    if (asset.fileSize && asset.fileSize > MAX_MEDIA_BYTES) {
      Alert.alert('Ảnh quá lớn', 'Vui lòng chọn ảnh dưới 25MB.');
      return;
    }

    setDraftMedia({
      uri: asset.uri,
      name:
        asset.fileName && asset.fileName.length > 0
          ? asset.fileName
          : `treasure-${Date.now()}.jpg`,
      type: asset.type && asset.type.length > 0 ? asset.type : 'image/jpeg',
    });
  };

  const handleSave = async (): Promise<void> => {
    if (draftContent.trim().length === 0 || saving) {
      return;
    }
    setSaving(true);
    try {
      const created = await treasureApi.createTreasure(
        {
          category: draftCategory,
          content: draftContent.trim(),
          emoji: draftEmoji,
        },
        draftMedia,
      );
      setTreasures(prev => {
        const next = [created, ...prev];
        void cacheTreasures(next);
        return next;
      });
      setAddVisible(false);
      resetDraft();
    } catch {
      Alert.alert(
        'Không thể lưu',
        'Đã có lỗi xảy ra khi cất giữ điều này. Vui lòng thử lại.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    const previous = treasures;
    const next = previous.filter(item => item.id !== id);
    setTreasures(next); // optimistic
    void cacheTreasures(next);
    try {
      await treasureApi.deleteTreasure(id);
    } catch {
      setTreasures(previous); // revert on failure
      void cacheTreasures(previous);
      Alert.alert('Không thể xoá', 'Vui lòng thử lại.');
    }
  };

  const comfortCategory = comfortTreasure
    ? getTreasureCategory(comfortTreasure.category)
    : null;

  const renderList = (): React.ReactNode => {
    if (loading && treasures.length === 0) {
      return (
        <View style={styles.stateBlock}>
          <ActivityIndicator color={COLORS.comfortHeader} />
        </View>
      );
    }
    if (error && treasures.length === 0) {
      return (
        <View style={styles.stateBlock}>
          <Feather name="cloud-off" size={40} color={COLORS.textTertiary} />
          <AppText style={styles.errorTitle}>Không tải được</AppText>
          <AppText style={styles.errorHint}>
            Mình chưa kết nối được tới hộp trân quý của bạn.
          </AppText>
          <Pressable style={styles.retryButton} onPress={() => void load()}>
            <Feather name="refresh-cw" size={15} color={COLORS.comfortHeaderDeep} />
            <AppText style={styles.retryButtonText}>Thử lại</AppText>
          </Pressable>
        </View>
      );
    }
    if (visible.length === 0) {
      return (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyEmoji}>🫙</AppText>
          <AppText style={styles.emptyTitle}>Chưa có gì ở đây</AppText>
          <AppText style={styles.emptyHint}>
            Hãy cất vào điều đầu tiên khiến bạn thấy ấm lòng.
          </AppText>
        </View>
      );
    }
    return visible.map(item => (
      <TreasureCard
        key={item.id}
        treasure={item}
        onDelete={() => void handleDelete(item.id)}
        onOpenMedia={() => openMediaViewer(item)}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ===== HERO ===== */}
        <View style={styles.hero}>
          <View style={styles.heroCircleLarge} />
          <View style={styles.heroCircleSmall} />

          <View style={styles.heroTopRow}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={22} color={COLORS.white} />
            </Pressable>
            <AppText style={styles.heroEyebrow}>Góc an yên của bạn</AppText>
            <View style={styles.backButton} />
          </View>

          <AppText style={styles.heroTitle}>Hộp Trân Quý 🎁</AppText>
          <AppText style={styles.heroSubtitle}>
            Nơi cất giữ những điều khiến bạn muốn bước tiếp. Khi mọi thứ trở nên
            nặng nề, hãy ghé thăm nơi đây.
          </AppText>

          {/* Comfort CTA */}
          <Pressable style={styles.comfortButton} onPress={openComfort}>
            <MaterialCommunityIcons
              name="hand-heart"
              size={20}
              color={COLORS.comfortHeaderDeep}
            />
            <AppText style={styles.comfortButtonText}>Xoa dịu tôi ngay</AppText>
          </Pressable>

          {/* Crisis access — one tap to real-world help */}
          <Pressable
            style={styles.crisisLink}
            onPress={() => navigation.navigate('MentalHealthSupport')}
          >
            <MaterialCommunityIcons
              name="lifebuoy"
              size={15}
              color={COLORS.white}
            />
            <AppText style={styles.crisisLinkText}>
              Đang gặp khủng hoảng? Tìm trợ giúp ngay
            </AppText>
          </Pressable>
        </View>

        {/* ===== CATEGORY FILTER ===== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
        >
          <CategoryChip
            label="Tất cả"
            emoji="🌟"
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          {TREASURE_CATEGORIES.map(category => (
            <CategoryChip
              key={category.id}
              label={category.label}
              emoji={category.emoji}
              active={filter === category.id}
              onPress={() => setFilter(category.id)}
            />
          ))}
        </ScrollView>

        {/* ===== TREASURE LIST ===== */}
        <View style={styles.listSection}>{renderList()}</View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ===== ADD FAB ===== */}
      <Pressable style={styles.fab} onPress={() => setAddVisible(true)}>
        <Feather name="plus" size={26} color={COLORS.white} />
      </Pressable>

      {/* ===== ADD MODAL ===== */}
      <Modal
        visible={addVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <AppText style={styles.modalTitle}>Cất giữ một điều quý giá</AppText>
              <Pressable onPress={() => setAddVisible(false)}>
                <Feather name="x" size={22} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category picker */}
              <AppText style={styles.fieldLabel}>Thuộc về</AppText>
              <View style={styles.categoryGrid}>
                {TREASURE_CATEGORIES.map(category => {
                  const selected = draftCategory === category.id;
                  return (
                    <Pressable
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        selected && {
                          backgroundColor: category.tintSoft,
                          borderColor: category.color,
                        },
                      ]}
                      onPress={() => {
                        setDraftCategory(category.id);
                        setDraftEmoji(category.emoji);
                      }}
                    >
                      <AppText style={styles.categoryOptionEmoji}>
                        {category.emoji}
                      </AppText>
                      <AppText
                        style={[
                          styles.categoryOptionLabel,
                          selected && styles.categoryOptionLabelActive,
                          selected && { color: category.color },
                        ]}
                      >
                        {category.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>

              {/* Content */}
              <AppText style={styles.fieldLabel}>Điều bạn muốn nhớ</AppText>
              <TextInput
                style={styles.contentInput}
                placeholder={getTreasureCategory(draftCategory).prompt}
                placeholderTextColor={COLORS.placeholder}
                value={draftContent}
                onChangeText={setDraftContent}
                multiline
                maxLength={280}
              />
              <AppText style={styles.counter}>{draftContent.length}/280</AppText>

              {/* Media picker — images only */}
              <AppText style={styles.fieldLabel}>Thêm ảnh (tuỳ chọn)</AppText>
              {draftMedia ? (
                <View style={styles.mediaDraftPreview}>
                  <Image
                    source={{ uri: draftMedia.uri }}
                    style={styles.mediaDraftThumb}
                  />
                  <AppText style={styles.mediaDraftLabel} numberOfLines={1}>
                    Đã chọn ảnh
                  </AppText>
                  <Pressable
                    hitSlop={8}
                    style={styles.mediaDraftRemove}
                    onPress={() => setDraftMedia(null)}
                  >
                    <Feather name="x" size={18} color={COLORS.textSecondary} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.mediaPickerRow}>
                  <Pressable
                    style={styles.mediaPickButton}
                    onPress={() => void handlePickPhoto()}
                  >
                    <Feather name="image" size={16} color={COLORS.comfortHeaderDeep} />
                    <AppText style={styles.mediaPickButtonText}>Chọn ảnh</AppText>
                  </Pressable>
                </View>
              )}

              {/* Emoji picker */}
              <AppText style={styles.fieldLabel}>Chọn biểu tượng</AppText>
              <View style={styles.emojiGrid}>
                {TREASURE_EMOJI_CHOICES.map(emoji => {
                  const selected = draftEmoji === emoji;
                  return (
                    <Pressable
                      key={emoji}
                      style={[styles.emojiOption, selected && styles.emojiOptionActive]}
                      onPress={() => setDraftEmoji(emoji)}
                    >
                      <AppText style={styles.emojiOptionText}>{emoji}</AppText>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                style={[
                  styles.saveButton,
                  (draftContent.trim().length === 0 || saving) &&
                    styles.saveButtonDisabled,
                ]}
                disabled={draftContent.trim().length === 0 || saving}
                onPress={() => void handleSave()}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <AppText style={styles.saveButtonText}>Cất vào hộp</AppText>
                )}
              </Pressable>
              <View style={styles.modalBottomSpacer} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ===== COMFORT OVERLAY ===== */}
      <Modal visible={comfortTreasure !== null} transparent animationType="fade">
        <View style={styles.comfortBackdrop}>
          {comfortTreasure && comfortCategory && (
            <Animated.View
              style={[
                styles.comfortCard,
                {
                  opacity: comfortAnim,
                  transform: [
                    {
                      scale: comfortAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <AppText style={styles.comfortHint}>Hãy hít thở thật sâu…</AppText>
              <AppText style={styles.comfortEmoji}>{comfortTreasure.emoji}</AppText>
              <AppText style={styles.comfortCategory}>
                {comfortCategory.label}
              </AppText>
              <AppText style={styles.comfortContent}>
                {comfortTreasure.content}
              </AppText>

              {comfortTreasure.mediaUrl &&
                comfortTreasure.mediaType === 'IMAGE' && (
                  <Pressable
                    style={styles.comfortMediaImageWrap}
                    onPress={() => openMediaViewer(comfortTreasure)}
                  >
                    <Image
                      source={{ uri: comfortTreasure.mediaUrl }}
                      style={styles.comfortMediaImage}
                    />
                  </Pressable>
                )}
              {comfortTreasure.mediaUrl &&
                (comfortTreasure.mediaType === 'AUDIO' ||
                  comfortTreasure.mediaType === 'VIDEO') && (
                  <Pressable
                    style={styles.comfortMediaChip}
                    onPress={() => openMediaViewer(comfortTreasure)}
                  >
                    <Feather
                      name="play-circle"
                      size={18}
                      color={COLORS.comfortHeaderDeep}
                    />
                    <AppText style={styles.comfortMediaChipText}>
                      {mediaActionLabel(comfortTreasure.mediaType)}
                    </AppText>
                  </Pressable>
                )}

              <View style={styles.comfortActions}>
                <Pressable style={styles.comfortShuffle} onPress={shuffleComfort}>
                  <MaterialCommunityIcons
                    name="shuffle-variant"
                    size={18}
                    color={COLORS.comfortHeaderDeep}
                  />
                  <AppText style={styles.comfortShuffleText}>Điều khác</AppText>
                </Pressable>
                <Pressable style={styles.comfortClose} onPress={closeComfort}>
                  <AppText style={styles.comfortCloseText}>Mình ổn hơn rồi 🤍</AppText>
                </Pressable>
                <Pressable
                  style={styles.comfortCrisisLink}
                  onPress={() => {
                    closeComfort();
                    navigation.navigate('MentalHealthSupport');
                  }}
                >
                  <AppText style={styles.comfortCrisisText}>
                    Mình cần nói chuyện với ai đó ngay
                  </AppText>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>

      {/* ===== MEDIA VIEWER ===== */}
      <TreasureMediaViewer
        url={mediaViewer?.url ?? null}
        type={mediaViewer?.type ?? null}
        emoji={mediaViewer?.emoji}
        onClose={() => setMediaViewer(null)}
      />
    </SafeAreaView>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

const CategoryChip: React.FC<{
  label: string;
  emoji: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, emoji, active, onPress }) => (
  <Pressable
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
  >
    <AppText style={styles.chipEmoji}>{emoji}</AppText>
    <AppText style={[styles.chipLabel, active && styles.chipLabelActive]}>
      {label}
    </AppText>
  </Pressable>
);

const TreasureCard: React.FC<{
  treasure: Treasure;
  onDelete: () => void;
  onOpenMedia: () => void;
}> = ({ treasure, onDelete, onOpenMedia }) => {
  const category = getTreasureCategory(treasure.category);
  const hasMedia = Boolean(treasure.mediaUrl && treasure.mediaType);
  return (
    <View style={[styles.treasureCard, { borderLeftColor: category.color }]}>
      <View style={[styles.treasureEmojiBox, { backgroundColor: category.tintSoft }]}>
        <AppText style={styles.treasureEmoji}>{treasure.emoji}</AppText>
      </View>
      <View style={styles.treasureBody}>
        <AppText style={[styles.treasureCategory, { color: category.color }]}>
          {category.label}
        </AppText>
        <AppText style={styles.treasureContent}>{treasure.content}</AppText>

        {hasMedia && treasure.mediaType === 'IMAGE' && (
          <Pressable onPress={onOpenMedia}>
            <Image
              source={{ uri: treasure.mediaUrl }}
              style={styles.cardMediaThumb}
            />
          </Pressable>
        )}
        {hasMedia &&
          (treasure.mediaType === 'AUDIO' ||
            treasure.mediaType === 'VIDEO') && (
            <Pressable style={styles.cardMediaChip} onPress={onOpenMedia}>
              <Feather name="play-circle" size={14} color={category.color} />
              <AppText style={[styles.cardMediaChipText, { color: category.color }]}>
                {mediaActionLabel(treasure.mediaType)}
              </AppText>
            </Pressable>
          )}
      </View>
      <Pressable hitSlop={8} style={styles.treasureDelete} onPress={onDelete}>
        <Feather name="trash-2" size={16} color={COLORS.textTertiary} />
      </Pressable>
    </View>
  );
};

export default TreasureBoxScreen;
