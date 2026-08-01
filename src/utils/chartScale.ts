export interface AxisScale {
  /** Y-axis top value to pass as `fromNumber` alongside `fromZero`. */
  top: number;
  /** Number of equal segments the axis is divided into (react-native-chart-kit `segments`). */
  segments: number;
}

export interface AxisScaleOptions {
  /** Smallest unit a gridline may land on (e.g. 1 for whole meal counts, 0.5 for liters). */
  step?: number;
  /** Number of gridlines/segments the chart is divided into. */
  segments?: number;
  /** Axis never shrinks below this value, even for an all-zero/empty week. */
  minTop?: number;
}

/**
 * Computes a Y-axis top + segment count so every gridline lands on a "clean" multiple of
 * `step`, for use with react-native-chart-kit's `fromZero` + `fromNumber` + `segments` props.
 *
 * react-native-chart-kit derives the axis top from `Math.max(...data)` and divides it into
 * `segments` equal parts (see AbstractChart.calcScaler / renderHorizontalLabels), rounding
 * each tick label independently. Whenever the data max isn't evenly divisible by `segments`,
 * that produces duplicate/misaligned rounded labels — e.g. a week topping out at 3 meals with
 * segments=4 renders ticks 0, 0.75, 1.5, 2.25, 3 → displayed as "0, 1, 2, 2, 3". Passing this
 * function's `top` as `fromNumber` (with `fromZero` also set) forces the real axis top to a
 * value we've already chosen to be a clean multiple of `step * segments`, so every label is
 * exact and never repeats.
 */
export const buildAxisScale = (
  values: number[],
  { step = 1, segments = 4, minTop = step * segments }: AxisScaleOptions = {},
): AxisScale => {
  const maxValue = values.length > 0 ? Math.max(0, ...values) : 0;
  const unit = step * segments;
  const target = Math.max(minTop, maxValue);
  const rawTop = Math.ceil(target / unit) * unit || unit;
  // Guard against float drift from the division above (e.g. step=0.5 -> 1.9999999999998).
  const top = Number(rawTop.toFixed(6));

  return { top, segments };
};
