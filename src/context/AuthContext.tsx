'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';

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
  isLoggingOut: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const logout = async () => {
    setIsLoggingOut(true);
    
    // 로그아웃 로그 기록 (사용자 정보가 있는 경우에만)
    if (user) {
      try {
        await fetch(getApiUrl('/api/users/logout'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            name: user.name
          })
        });
      } catch (error) {
        console.error('로그아웃 로그 기록 실패:', error);
        // 로그 기록 실패해도 로그아웃은 진행
      }
    }
    
    setUser(null);
    sessionStorage.removeItem('user');
    router.push('/login'); // 로그아웃 후 로그인 화면으로 이동
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    isLoggingOut,
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