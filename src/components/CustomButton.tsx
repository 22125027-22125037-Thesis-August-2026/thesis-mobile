import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';

interface Props {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
}

const CustomButton = ({ title, onPress, isLoading = false }: Props) => {
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress} 
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <>
          <Text style={styles.text}>{title}</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.text, // Màu nâu đen
    borderRadius: 30,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    // Shadow
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default CustomButton;