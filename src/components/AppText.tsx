import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';

import { FONTS } from '@/theme';

type AppTextWeight = keyof typeof FONTS;

interface AppTextProps extends TextProps {
  weight?: AppTextWeight;
}

const getWeightFromFontWeight = (
  fontWeight: TextStyle['fontWeight'],
): AppTextWeight | undefined => {
  if (!fontWeight) {
    return undefined;
  }

  const normalizedFontWeight = String(fontWeight).toLowerCase();

  if (normalizedFontWeight === 'bold' || Number(normalizedFontWeight) >= 700) {
    return 'bold';
  }

  if (normalizedFontWeight === '600' || normalizedFontWeight === 'semibold') {
    return 'semiBold';
  }

  if (normalizedFontWeight === '500' || normalizedFontWeight === 'medium') {
    return 'medium';
  }

  return 'regular';
};

const AppText: React.FC<AppTextProps> = ({
  weight,
  style,
  ...restProps
}) => {
  const flattenedStyle = StyleSheet.flatten(style) as TextStyle | undefined;
  const derivedWeight = getWeightFromFontWeight(flattenedStyle?.fontWeight);
  const resolvedWeight = weight ?? derivedWeight ?? 'regular';

  const resolvedFontFamily =
    flattenedStyle?.fontFamily ?? FONTS[resolvedWeight];

  return (
    <Text
      {...restProps}
      style={[style, { fontFamily: resolvedFontFamily, fontWeight: undefined }]}
    />
  );
};

export default AppText;
