import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Expose a way to set mock user from Login.jsx
  const setMockUser = (mockUser) => {
    setUser(mockUser);
    localStorage.setItem('mock_admin', JSON.stringify(mockUser));
  };

  const logoutMock = () => {
    setUser(null);
    localStorage.removeItem('mock_admin');
    localStorage.removeItem('farm_cart');
    localStorage.removeItem('farm_wishlist');
  };

  useEffect(() => {
    // Check if we have a mock user for demo purposes
    const mock = localStorage.getItem('mock_admin');
    if (mock) {
      setUser(JSON.parse(mock));
      setLoading(false);
      return;
    }

    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // We can add role checking logic here later (e.g., checking user metadata for admin role)
  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, setMockUser, logoutMock }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
