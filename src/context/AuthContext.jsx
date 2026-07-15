import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Frontend User
  const [adminUser, setAdminUser] = useState(null); // Admin User
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set mock user for frontend testing
  const setMockUser = (mockUser) => {
    setUser(mockUser);
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
  };

  // Set mock admin for admin panel
  const setMockAdmin = (mockAdmin) => {
    setAdminUser(mockAdmin);
    localStorage.setItem('mock_admin', JSON.stringify(mockAdmin));
  };

  // Logout frontend user
  const logoutMock = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
    localStorage.removeItem('farm_cart');
    localStorage.removeItem('farm_wishlist');
  };

  // Logout admin user
  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('mock_admin');
  };

  useEffect(() => {
    // 1. Load Admin Session
    const mockAdmin = localStorage.getItem('mock_admin');
    if (mockAdmin) {
      setAdminUser(JSON.parse(mockAdmin));
    }

    // 2. Load User Session (Mock or Real)
    const mockUserStr = localStorage.getItem('mock_user');
    if (mockUserStr) {
      setUser(JSON.parse(mockUserStr));
    }

    // Get active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user && !mockUserStr) {
        setUser(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user && !localStorage.getItem('mock_user')) {
        setUser(session.user);
      } else if (!session?.user && !localStorage.getItem('mock_user')) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = !!adminUser;

  return (
    <AuthContext.Provider value={{ session, user, adminUser, isAdmin, loading, setMockUser, setMockAdmin, logoutMock, logoutAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
