"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

import { getUserInfoFromToken, UserInfo } from '@/app/utils/helper/tokenHelper';

interface AuthContextType {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);

  // Check for existing token on initial load
  useEffect(() => {
    const userInfo = getUserInfoFromToken();
    if (userInfo) {
      setUser(userInfo);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
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