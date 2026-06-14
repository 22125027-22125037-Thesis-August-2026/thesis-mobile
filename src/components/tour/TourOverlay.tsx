import React, { useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { TOUR_STEPS } from '@/constants/tour';
import { useTour } from '@/context/TourContext';
import { COLORS } from '@/theme';

const SCRIM_COLOR = 'rgba(15, 23, 42, 0.84)';
const HOLE_PADDING = 8;
const TOOLTIP_GAP = 16;
const CARD_MARGIN = 20;
const SAFE_TOP = 48;
const SAFE_BOTTOM = 28;
const CARD_HEIGHT_FALLBACK = 200;

const TourOverlay: React.FC = () => {
  const { t } = useTranslation();
  const window = useWindowDimensions();
  const { isActive, stepIndex, totalSteps, currentStep, targetRect, next, skip } = useTour();

  // Kích thước thực của overlay (đo bằng onLayout) để khớp tuyệt đối với toạ độ
  // measureInWindow của các phần tử — tránh lệch do status bar.
  const [size, setSize] = useState({ width: window.width, height: window.height });
  const [cardHeight, setCardHeight] = useState(0);
  // Gốc toạ độ window của chính overlay. Khi app chạy edge-to-edge, gốc của
  // overlay khác gốc mà measureInWindow dùng cho các phần tử; đo và trừ đi để
  // khử lệch trên mọi thiết bị.
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<View | null>(null);

  if (!isActive || !currentStep) {
    return null;
  }

  const { width: W, height: H } = size;
  const isLast = stepIndex === totalSteps - 1;

  // Quy đổi rect của target (toạ độ window) về toạ độ cục bộ của overlay.
  const localRect = targetRect
    ? {
        x: targetRect.x - origin.x,
        y: targetRect.y - origin.y,
        width: targetRect.width,
        height: targetRect.height,
      }
    : null;

  // Vùng khoét sáng (đã cộng padding).
  const hole = localRect
    ? {
        x: Math.max(localRect.x - HOLE_PADDING, 0),
        y: Math.max(localRect.y - HOLE_PADDING, 0),
        width: localRect.width + HOLE_PADDING * 2,
        height: localRect.height + HOLE_PADDING * 2,
      }
    : null;
  const holeRadius = hole ? Math.min(20, hole.height / 2) : 0;

  // Vị trí thẻ tooltip: chọn trên/dưới theo chỗ trống rồi kẹp trong màn hình.
  const cardH = cardHeight || CARD_HEIGHT_FALLBACK;
  const cardTop = (() => {
    if (!localRect || currentStep.placement === 'center') {
      return Math.max(SAFE_TOP, (H - cardH) / 2);
    }
    const belowTop = localRect.y + localRect.height + TOOLTIP_GAP;
    const aboveTop = localRect.y - TOOLTIP_GAP - cardH;

    let top: number;
    if (currentStep.placement === 'above') {
      top = aboveTop >= SAFE_TOP ? aboveTop : belowTop;
    } else {
      top = belowTop + cardH <= H - SAFE_BOTTOM ? belowTop : aboveTop;
    }
    // Kẹp để thẻ luôn nằm trọn trong khung hình.
    return Math.max(SAFE_TOP, Math.min(top, H - SAFE_BOTTOM - cardH));
  })();

  const handleOverlayLayout = (e: LayoutChangeEvent): void => {
    const { width, height } = e.nativeEvent.layout;
    setSize(prev =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
    // Đo gốc window thật của overlay để khử lệch (edge-to-edge / status bar).
    overlayRef.current?.measureInWindow((x, y) => {
      setOrigin(prev => (prev.x === x && prev.y === y ? prev : { x, y }));
    });
  };

  const handleCardLayout = (e: LayoutChangeEvent): void => {
    const h = e.nativeEvent.layout.height;
    setCardHeight(prev => (prev === h ? prev : h));
  };

  return (
    <View
      ref={overlayRef}
      collapsable={false}
      style={styles.overlay}
      onLayout={handleOverlayLayout}
      pointerEvents="box-none"
    >
      {/* Lớp nền tối + khoét sáng; chạm nền để sang bước kế */}
      <Pressable style={StyleSheet.absoluteFill} onPress={next}>
        <Svg width={W} height={H}>
          <Defs>
            <Mask id="tour-hole">
              <Rect x={0} y={0} width={W} height={H} fill="#fff" />
              {hole && (
                <Rect
                  x={hole.x}
                  y={hole.y}
                  width={hole.width}
                  height={hole.height}
                  rx={holeRadius}
                  ry={holeRadius}
                  fill="#000"
                />
              )}
            </Mask>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={W}
            height={H}
            fill={SCRIM_COLOR}
            mask="url(#tour-hole)"
          />
        </Svg>
      </Pressable>

      {/* Viền sáng quanh phần tử được highlight */}
      {hole && (
        <View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              left: hole.x,
              top: hole.y,
              width: hole.width,
              height: hole.height,
              borderRadius: holeRadius,
            },
          ]}
        />
      )}

      {/* Thẻ tooltip */}
      <View
        style={[styles.card, { top: cardTop, left: CARD_MARGIN, right: CARD_MARGIN }]}
        onLayout={handleCardLayout}
      >
        <AppText style={styles.title}>{t(`tour.steps.${currentStep.id}.title`)}</AppText>
        <AppText style={styles.body}>{t(`tour.steps.${currentStep.id}.body`)}</AppText>

        <View style={styles.dotsRow}>
          {TOUR_STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === stepIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        <View style={styles.actionsRow}>
          {!isLast ? (
            <Pressable hitSlop={8} onPress={skip}>
              <AppText style={styles.skipText}>{t('tour.skip')}</AppText>
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable style={styles.nextBtn} onPress={next}>
            <AppText style={styles.nextBtnText}>
              {isLast ? t('tour.done') : t('tour.next')}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: COLORS.primaryLight,
  },
  card: {
    position: 'absolute',
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: COLORS.shadowBase,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
    marginBottom: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: COLORS.border,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 999,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default TourOverlay;
