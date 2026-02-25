'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  userId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('[v0] checkAuth - Checking authentication status');
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`;
      console.log('[v0] checkAuth - Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        credentials: 'include',
      });
      
      console.log('[v0] checkAuth - Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[v0] checkAuth - User authenticated:', data);
        setUser(data);
      } else {
        console.log('[v0] checkAuth - Response not ok - User not authenticated');
      }
    } catch (error) {
      console.error('[v0] checkAuth - Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    console.log('[v0] login - Login attempt for user:', username);
    setLoading(true);
    try {
      const loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`;
      console.log('[v0] login - POST to:', loginUrl);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      console.log('[v0] login - Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('[v0] login - Error response:', error);
        throw new Error(error.error || error.details || 'Login failed');
      }

      const data = await response.json();
      console.log('[v0] login - Login successful, setting user:', username);
      setUser({
        username: data.username,
        userId: 'admin',
      });
    } catch (error) {
      console.error('[v0] login - Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('[v0] logout - Logging out user');
    setLoading(true);
    try {
      const logoutUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`;
      console.log('[v0] logout - POST to:', logoutUrl);
      
      const response = await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include',
      });
      
      console.log('[v0] logout - Response status:', response.status);
      console.log('[v0] logout - User cleared');
      setUser(null);
    } catch (error) {
      console.error('[v0] logout - Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
