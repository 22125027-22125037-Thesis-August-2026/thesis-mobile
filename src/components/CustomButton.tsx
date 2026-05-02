import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@/theme';
import AppText from './AppText';

interface Props {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: string;
}

const CustomButton = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  icon = 'arrow-forward',
}: Props) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && !isLoading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <>
          <AppText style={styles.text} weight="bold">{title}</AppText>
          <Ionicons name={icon} size={20} color={COLORS.white} />
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: 30,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: COLORS.buttonPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  text: {
    color: COLORS.white,
    fontSize: 18,
    marginRight: 10,
  },
});

export default CustomButton;