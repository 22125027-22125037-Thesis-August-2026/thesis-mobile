import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';
import { setLogoutHandler } from '../api/axiosClient';
import { AuthResponse, User } from '../types/auth';

const AUTH_BASE_PATH = '/api/v1/auth';

interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  userInfo: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>; // THÊM HÀM REGISTER VÀO ĐÂY
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
      const res = await axiosClient.post<AuthResponse>(`${AUTH_BASE_PATH}/login`, { email, password: pass });
      const { token } = res.data;

      setUserToken(token);
      await AsyncStorage.setItem('userToken', token);

      const userRes = await axiosClient.get<User>(`${AUTH_BASE_PATH}/me`);
      setUserInfo(userRes.data);
      
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Đăng nhập thất bại', 'Vui lòng kiểm tra email hoặc mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HÀM ĐĂNG KÝ (REGISTER) MỚI ĐƯỢC THÊM
  // ==========================================
  const register = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      // Giả định backend nhận /register. Hãy đổi URL nếu API backend của bạn khác.
      await axiosClient.post(`${AUTH_BASE_PATH}/register`, { email, password: pass, fullName: 'New User' });
      // Không tự động set Token ở đây vì app sẽ điều hướng người dùng sang trang Login
    } catch (error) {
      console.log('Register error:', error);
      throw error; // Ném lỗi ra để màn hình RegisterScreen bắt được
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
        try {
          const userRes = await axiosClient.get<User>(`${AUTH_BASE_PATH}/me`);
          setUserInfo(userRes.data);
        } catch (err: any) {
          if (err.response && err.response.status === 403) {
            // Token hết hạn hoặc không hợp lệ
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
            setUserInfo(null);
            console.log('Token expired or invalid, removed from storage');
          } else {
            // Lỗi khác (mạng, server, ...), giữ nguyên token
            console.log('Error when fetching user info:', err);
          }
        }
      }
    } catch (e) {
      console.log('Not logged in');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    isLoggedIn();
    // Đăng ký hàm logout cho axiosClient khi token hết hạn
    setLogoutHandler(logout);
  }, []);

  return (
    // Nhớ truyền register vào Provider nhé
    <AuthContext.Provider value={{ login, register, logout, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};