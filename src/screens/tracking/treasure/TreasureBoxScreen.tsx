import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import {
  TREASURE_CATEGORIES,
  TREASURE_EMOJI_CHOICES,
  getTreasureCategory,
} from '@/constants/treasures';
import {
  addTreasure,
  deleteTreasure,
  loadTreasures,
  pickRandomTreasure,
} from '@/utils/treasureStore';
import type { Treasure, TreasureCategoryId } from '@/types';
import { COLORS } from '@/theme';
import { styles } from './TreasureBoxScreen.styles';

type Nav = NavigationProp<RootStackParamList>;
type Filter = TreasureCategoryId | 'all';

const TreasureBoxScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  // Add modal state
  const [addVisible, setAddVisible] = useState(false);
  const [draftCategory, setDraftCategory] = useState<TreasureCategoryId>('reasons');
  const [draftEmoji, setDraftEmoji] = useState('🌅');
  const [draftContent, setDraftContent] = useState('');

  // Comfort ("Xoa dịu tôi") overlay state
  const [comfortTreasure, setComfortTreasure] = useState<Treasure | null>(null);
  const comfortAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    void loadTreasures().then(setTreasures);
  }, []);

  const visible =
    filter === 'all'
      ? treasures
      : treasures.filter(item => item.category === filter);

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
  };

  const handleSave = async (): Promise<void> => {
    if (draftContent.trim().length === 0) {
      return;
    }
    const next = await addTreasure({
      category: draftCategory,
      content: draftContent,
      emoji: draftEmoji,
    });
    setTreasures(next);
    setAddVisible(false);
    resetDraft();
  };

  const handleDelete = async (id: string): Promise<void> => {
    const next = await deleteTreasure(id);
    setTreasures(next);
  };

  const comfortCategory = comfortTreasure
    ? getTreasureCategory(comfortTreasure.category)
    : null;

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
        <View style={styles.listSection}>
          {visible.length === 0 ? (
            <View style={styles.emptyState}>
              <AppText style={styles.emptyEmoji}>🫙</AppText>
              <AppText style={styles.emptyTitle}>Chưa có gì ở đây</AppText>
              <AppText style={styles.emptyHint}>
                Hãy cất vào điều đầu tiên khiến bạn thấy ấm lòng.
              </AppText>
            </View>
          ) : (
            visible.map(item => (
              <TreasureCard
                key={item.id}
                treasure={item}
                onDelete={() => void handleDelete(item.id)}
              />
            ))
          )}
        </View>

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
                  draftContent.trim().length === 0 && styles.saveButtonDisabled,
                ]}
                disabled={draftContent.trim().length === 0}
                onPress={() => void handleSave()}
              >
                <AppText style={styles.saveButtonText}>Cất vào hộp</AppText>
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
}> = ({ treasure, onDelete }) => {
  const category = getTreasureCategory(treasure.category);
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
      </View>
      <Pressable hitSlop={8} style={styles.treasureDelete} onPress={onDelete}>
        <Feather name="trash-2" size={16} color={COLORS.textTertiary} />
      </Pressable>
    </View>
  );
};

export default TreasureBoxScreen;
