'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'EXPERT';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 앱이 처음 로드될 때 sessionStorage에서 사용자 정보를 가져옵니다.
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from sessionStorage', error);
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    console.log('AuthContext login 호출:', userData);
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    console.log('사용자 정보 저장 완료, 홈으로 이동');
    router.push('/'); // 로그인 후 홈으로 이동
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    router.push('/'); // 로그아웃 후 메인페이지로 이동
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 