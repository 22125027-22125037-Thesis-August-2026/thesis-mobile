import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = () => {
  const { logout, userInfo } = useContext(AuthContext)!;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, {userInfo?.fullName}!</Text>
      <Text style={{marginBottom: 20}}>Role: {userInfo?.role}</Text>
      <Button title="Logout" onPress={logout} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' },
});

export default HomeScreen;