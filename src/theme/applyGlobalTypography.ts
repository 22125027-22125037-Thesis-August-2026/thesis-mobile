import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
} from 'react-native';

import { FONTS } from './typography';

let isTypographyApplied = false;

const withDefaultFont = (
  style: StyleProp<TextStyle> | undefined,
): StyleProp<TextStyle> => {
  if (!style) {
    return { fontFamily: FONTS.regular };
  }

  return [{ fontFamily: FONTS.regular }, style];
};

export const applyGlobalTypographyDefaults = (): void => {
  if (isTypographyApplied) {
    return;
  }

  const textComponent = Text as typeof Text & {
    defaultProps?: TextProps;
  };
  textComponent.defaultProps = textComponent.defaultProps ?? {};
  textComponent.defaultProps.style = withDefaultFont(
    textComponent.defaultProps.style,
  );

  const textInputComponent = TextInput as typeof TextInput & {
    defaultProps?: TextInputProps;
  };
  textInputComponent.defaultProps = textInputComponent.defaultProps ?? {};
  textInputComponent.defaultProps.style = withDefaultFont(
    textInputComponent.defaultProps.style,
  );

  isTypographyApplied = true;
};
