import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '@/theme';
import AppText from './AppText';

interface Props {
  label?: string; // Cho phép không truyền label
  iconName: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
  error?: boolean; // (MỚI) Có lỗi hay không?
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
  error = false, // Mặc định là không lỗi
}: Props) => {
  return (
    <View style={styles.container}>
      {label && <AppText style={styles.label} weight="semiBold">{label}</AppText>}
      <View style={[
        styles.inputWrapper, 
        error && { borderColor: COLORS.errorBorder, borderWidth: 1.5 } 
      ]}>
        <Ionicons 
          name={iconName} 
          size={20} 
          color={error ? COLORS.errorBorder : COLORS.inputIcon} 
          style={styles.icon} 
        />
        <TextInput
          style={[styles.input, { fontFamily: FONTS.regular }]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize="none"
        />
        {isPassword && (
          <TouchableOpacity onPress={onTogglePassword}>
            <Ionicons
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
});

export default CustomInput;