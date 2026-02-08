import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';
import { AuthResponse, User } from '../types/auth';

interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  userInfo: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.post<AuthResponse>('/auth/login', { email, password: pass });
      const { token } = res.data;

      setUserToken(token);
      await AsyncStorage.setItem('userToken', token);

      const userRes = await axiosClient.get<User>('/auth/me');
      setUserInfo(userRes.data);
      
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Đăng nhập thất bại', 'Vui lòng kiểm tra email hoặc mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem('userToken');
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      let token = await AsyncStorage.getItem('userToken');
      if (token) {
        setUserToken(token);
        const userRes = await axiosClient.get<User>('/auth/me');
        setUserInfo(userRes.data);
      }
    } catch (e) {
      console.log('Not logged in');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};