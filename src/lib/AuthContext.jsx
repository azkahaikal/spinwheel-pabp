/**
 * AuthContext.jsx — Supabase version
 *
 * Keeps the same public API that the rest of the app already consumes:
 *   useAuth() → { user, isAuthenticated, isLoadingAuth, logout, navigateToLogin, ... }
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState(null);

  // ── Bootstrap: read the current session once on mount ──────────────────────
  useEffect(() => {
    // 1. Get the current session synchronously if available
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    // 2. Listen for future sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const applySession = (session) => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || session.user.email,
      });
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoadingAuth(false);
    setAuthChecked(true);
    setAuthError(null);
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = window.location.origin;
  };

  const navigateToLogin = () => {
    // Redirect to Supabase OAuth (Google).
    // Change `provider` to 'github', 'discord', etc. as needed,
    // or swap for supabase.auth.signInWithOtp({ email }) for magic-link.
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  // checkUserAuth / checkAppState kept as no-ops so any code that calls them
  // doesn't break.
  const checkUserAuth = async () => {};
  const checkAppState = async () => {};

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
