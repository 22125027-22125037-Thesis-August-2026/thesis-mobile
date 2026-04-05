import React, { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';
import { setLogoutHandler } from '../api/axiosClient';
import { AuthResponse, RegisterPayload, User, UserRole } from '../types/auth';

const AUTH_BASE_PATH = '/api/v1/auth';
const USER_TOKEN_KEY = 'userToken';
const USER_ROLE_KEY = 'userRole';
const PROFILE_ID_KEY = 'profileId';
const AUTH_STORAGE_KEYS = [USER_TOKEN_KEY, USER_ROLE_KEY, PROFILE_ID_KEY];

type ApiResponse<T> = {
  data: T;
};

const unwrapApiData = <T,>(payload: T | ApiResponse<T>): T => {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in (payload as ApiResponse<T>)
  ) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
};

interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  userInfo: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const hasBootstrappedRef = useRef(false);

  const clearAuthSession = async () => {
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);
  };

  const isOrphanTokenError = (err: any): boolean => {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message || err?.response?.data?.error || err?.message || '';

    if (status === 401 || status === 403) {
      return true;
    }

    return status === 500 && String(message).toLowerCase().includes('user not found');
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.post<AuthResponse | ApiResponse<AuthResponse>>(
        `${AUTH_BASE_PATH}/login`,
        { email, password: pass },
      );
      const authPayload = unwrapApiData<AuthResponse>(res.data);
      const { token, profileId, role } = authPayload;

      setUserToken(token);
      await AsyncStorage.multiSet([
        [USER_TOKEN_KEY, token],
        [USER_ROLE_KEY, role],
        [PROFILE_ID_KEY, profileId],
      ]);

      const userRes = await axiosClient.get<User | ApiResponse<User>>(
        `${AUTH_BASE_PATH}/me`,
      );
      const profilePayload = unwrapApiData<User>(userRes.data);
      setUserInfo({
        ...profilePayload,
        role,
        profileId,
      });
      
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
  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      await axiosClient.post(`${AUTH_BASE_PATH}/register`, payload);
    } catch (error) {
      console.log('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await clearAuthSession();
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      const [[, token], [, role], [, profileId]] = await AsyncStorage.multiGet([
        USER_TOKEN_KEY,
        USER_ROLE_KEY,
        PROFILE_ID_KEY,
      ]);

      if (token) {
        setUserToken(token);
        if (role && profileId) {
          setUserInfo({
            profileId,
            role: role as UserRole,
            fullName: '',
            avatarUrl: undefined,
          });
        }

        try {
          const userRes = await axiosClient.get<User | ApiResponse<User>>(
            `${AUTH_BASE_PATH}/me`,
          );
          const profilePayload = unwrapApiData<User>(userRes.data);
          setUserInfo({
            ...profilePayload,
            role: (role as UserRole) || profilePayload.role,
            profileId: profileId || profilePayload.profileId,
          });
        } catch (err: any) {
          if (isOrphanTokenError(err)) {
            await clearAuthSession();
            console.log('Auth session is invalid or orphaned, removed from storage');
          } else if (err.message === 'Network Error') {
            console.log('Auth server is unreachable. Keep local session and retry later.');
          } else {
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
    if (hasBootstrappedRef.current) {
      return;
    }

    hasBootstrappedRef.current = true;
    isLoggedIn();
    setLogoutHandler(logout);
  }, []);

  return (
    <AuthContext.Provider value={{ login, register, logout, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};