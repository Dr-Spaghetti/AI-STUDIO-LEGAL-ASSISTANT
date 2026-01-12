// ============================================
// Authentication Service
// ============================================
// Handles staff login/logout with Supabase Auth
// Falls back to demo mode when not configured

import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'viewer';
  tenantId: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
  firmName?: string;
}

// Demo user for when auth is not configured
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@lawfirm.com',
  name: 'Demo User',
  role: 'admin',
  tenantId: '00000000-0000-0000-0000-000000000001',
};

// Local storage key for session persistence
const AUTH_STORAGE_KEY = 'legal_intake_auth';

/**
 * Check if Supabase auth is configured
 */
export function isAuthConfigured(): boolean {
  return supabase !== null;
}

/**
 * Get stored session from localStorage
 */
export function getStoredSession(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const { user, expiresAt } = JSON.parse(stored);
      // Check if session is still valid (24 hours)
      if (new Date(expiresAt) > new Date()) {
        return user;
      }
      // Clear expired session
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Store session in localStorage
 */
function storeSession(user: User): void {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
    user,
    expiresAt: expiresAt.toISOString(),
  }));
}

/**
 * Clear stored session
 */
function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
  // Demo mode - accept any credentials
  if (!isAuthConfigured()) {
    console.log('[Auth] Demo mode - Supabase not configured');
    const demoUser = {
      ...DEMO_USER,
      email: credentials.email,
      name: credentials.email.split('@')[0],
    };
    storeSession(demoUser);
    return { user: demoUser, error: null };
  }

  try {
    const { data, error } = await supabase!.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Login failed' };
    }

    // Get user profile from database
    const { data: profile } = await supabase!
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: profile?.name || data.user.email?.split('@')[0] || 'User',
      role: profile?.role || 'staff',
      tenantId: profile?.tenant_id || '00000000-0000-0000-0000-000000000001',
      avatarUrl: profile?.avatar_url,
    };

    storeSession(user);
    return { user, error: null };
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return { user: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  clearSession();

  if (isAuthConfigured()) {
    try {
      await supabase!.auth.signOut();
    } catch (err) {
      console.error('[Auth] Logout error:', err);
    }
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  // Check stored session first
  const storedUser = getStoredSession();
  if (storedUser) {
    return storedUser;
  }

  // Demo mode
  if (!isAuthConfigured()) {
    return null;
  }

  try {
    const { data: { user } } = await supabase!.auth.getUser();

    if (!user) {
      return null;
    }

    // Get user profile
    const { data: profile } = await supabase!
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const authUser: User = {
      id: user.id,
      email: user.email || '',
      name: profile?.name || user.email?.split('@')[0] || 'User',
      role: profile?.role || 'staff',
      tenantId: profile?.tenant_id || '00000000-0000-0000-0000-000000000001',
      avatarUrl: profile?.avatar_url,
    };

    storeSession(authUser);
    return authUser;
  } catch (err) {
    console.error('[Auth] Get user error:', err);
    return null;
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error: string | null }> {
  if (!isAuthConfigured()) {
    return { success: true, error: null }; // Demo mode
  }

  try {
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('[Auth] Password reset error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, requiredRole: User['role']): boolean {
  if (!user) return false;

  const roleHierarchy: Record<User['role'], number> = {
    admin: 3,
    staff: 2,
    viewer: 1,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

export default {
  isAuthConfigured,
  login,
  logout,
  getCurrentUser,
  getStoredSession,
  requestPasswordReset,
  hasRole,
};
