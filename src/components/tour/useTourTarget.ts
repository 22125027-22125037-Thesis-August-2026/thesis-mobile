import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';

import { TourTargetKey } from '@/constants/tour';
import { TargetRect, useTour } from '@/context/TourContext';

/**
 * Gắn một phần tử UI làm "target" cho tour coach-mark.
 *
 * Cách dùng:
 *   const { ref, onLayout } = useTourTarget(TOUR_TARGETS.mood);
 *   <View ref={ref} onLayout={onLayout} collapsable={false}>...</View>
 *
 * `collapsable={false}` là bắt buộc trên Android để measureInWindow hoạt động.
 */
export const useTourTarget = (key: TourTargetKey) => {
  const { registerTarget, unregisterTarget } = useTour();
  const ref = useRef<View | null>(null);

  const measure = useCallback((): Promise<TargetRect | null> => {
    return new Promise(resolve => {
      const node = ref.current;
      if (!node) {
        resolve(null);
        return;
      }
      node.measureInWindow((x, y, width, height) => {
        if (width === 0 && height === 0) {
          resolve(null);
          return;
        }
        resolve({ x, y, width, height });
      });
    });
  }, []);

  useEffect(() => {
    registerTarget(key, measure);
    return () => unregisterTarget(key);
  }, [key, measure, registerTarget, unregisterTarget]);

  // onLayout không bắt buộc, nhưng giữ chỗ để re-đo nếu cần trong tương lai.
  const onLayout = useCallback(() => {}, []);

  return { ref, onLayout };
};
