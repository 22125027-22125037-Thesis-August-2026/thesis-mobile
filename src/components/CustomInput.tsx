import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONTS } from '@/theme';
import AppText from './AppText';

interface Props {
  label?: string;
  iconName: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
  errorMessage?: string;
}

const CustomInput = ({
  label,
  iconName,
  placeholder,
  value,
  onChangeText,
  isPassword = false,
  isPasswordVisible = false,
  onTogglePassword,
  errorMessage,
}: Props) => {
  const { t } = useTranslation();
  const hasError = !!errorMessage;
  return (
    <View style={styles.container}>
      {label && <AppText style={styles.label} weight="semiBold">{label}</AppText>}
      <View style={[
        styles.inputWrapper,
        hasError && { borderColor: COLORS.errorBorder, borderWidth: 1.5 },
      ]}>
        <Ionicons
          name={iconName}
          size={20}
          color={hasError ? COLORS.errorBorder : COLORS.inputIcon}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, { fontFamily: FONTS.regular }]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholderMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize="none"
          accessibilityLabel={label || placeholder}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={onTogglePassword}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible
                ? t('components.customInput.hidePassword')
                : t('components.customInput.showPassword')
            }
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      {hasError && (
        <View
          style={styles.errorRow}
          accessibilityRole="alert"
        >
          <Ionicons name="alert-circle" size={16} color={COLORS.errorText} />
          <AppText style={styles.errorMessage}>{errorMessage}</AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 7,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: COLORS.errorBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  errorMessage: {
    flex: 1,
    fontSize: 13,
    color: COLORS.errorText,
  },
});

export default CustomInput;