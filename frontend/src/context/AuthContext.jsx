import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const normalizeRole = (role) => {
  if (!role) return 'USER';
  const r = role.toString().toUpperCase().replace(/[\s_-]+/g, '');
  if (r.includes('SUPERADMIN') || r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (r.includes('ADMIN')) return 'ADMIN';
  return 'USER';
};

export const getDashboardRoute = (user) => {
  if (!user) return '/login';
  const norm = user.norm_role || normalizeRole(user.role);
  if (norm === 'SUPER_ADMIN') return '/super-admin/dashboard';
  if (norm === 'ADMIN') return '/admin/dashboard';
  return '/user/dashboard';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sentiment_scope_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed) {
        parsed.norm_role = parsed.norm_role || normalizeRole(parsed.role);
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sentiment_scope_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('sentiment_scope_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          const userData = {
            ...res.data,
            norm_role: res.data.norm_role || normalizeRole(res.data.role)
          };
          setUser(userData);
          localStorage.setItem('sentiment_scope_user', JSON.stringify(userData));
        } catch {
          // If stored token is invalid or expired, clear local storage
          localStorage.removeItem('sentiment_scope_token');
          localStorage.removeItem('sentiment_scope_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const quickLoginDefault = async () => {
    try {
      const res = await api.post('/auth/login', {
        email: 'shreya@sentimentscope.com',
        password: 'Password123!'
      });
      const userData = {
        ...res.data.user,
        norm_role: res.data.user.norm_role || normalizeRole(res.data.user.role)
      };
      localStorage.setItem('sentiment_scope_token', res.data.token);
      localStorage.setItem('sentiment_scope_user', JSON.stringify(userData));
      setToken(res.data.token);
      setUser(userData);
      return { user: userData, redirectRoute: getDashboardRoute(userData) };
    } catch {
      // Fallback local dummy user if backend is unreachable
      const fallbackUser = {
        id: 'usr_shreya_primary',
        email: 'shreya@sentimentscope.com',
        name: 'Shreya Yadav',
        full_name: 'Shreya Yadav',
        role: 'Super Admin',
        norm_role: 'SUPER_ADMIN',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        plan: 'Pro Plan'
      };
      setUser(fallbackUser);
      localStorage.setItem('sentiment_scope_user', JSON.stringify(fallbackUser));
      return { user: fallbackUser, redirectRoute: '/super-admin/dashboard' };
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const userData = {
      ...res.data.user,
      norm_role: res.data.user.norm_role || normalizeRole(res.data.user.role)
    };
    localStorage.setItem('sentiment_scope_token', res.data.token);
    localStorage.setItem('sentiment_scope_user', JSON.stringify(userData));
    setToken(res.data.token);
    setUser(userData);
    return {
      token: res.data.token,
      user: userData,
      redirectRoute: getDashboardRoute(userData)
    };
  };

  const register = async ({ name, email, phone, password, confirm_password, terms }) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      phone,
      password,
      confirm_password,
      terms
    });
    const userData = {
      ...res.data.user,
      norm_role: res.data.user.norm_role || normalizeRole(res.data.user.role)
    };
    localStorage.setItem('sentiment_scope_token', res.data.token);
    localStorage.setItem('sentiment_scope_user', JSON.stringify(userData));
    setToken(res.data.token);
    setUser(userData);
    return {
      token: res.data.token,
      user: userData,
      redirectRoute: getDashboardRoute(userData)
    };
  };

  const logout = () => {
    try {
      api.post('/auth/logout').catch(() => {});
    } catch {}
    localStorage.removeItem('sentiment_scope_token');
    localStorage.removeItem('sentiment_scope_user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (updatedUser) => {
    const userWithNorm = {
      ...updatedUser,
      norm_role: updatedUser.norm_role || normalizeRole(updatedUser.role)
    };
    setUser(userWithNorm);
    localStorage.setItem('sentiment_scope_user', JSON.stringify(userWithNorm));
  };

  const norm = user ? (user.norm_role || normalizeRole(user.role)) : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        normRole: norm,
        isAuthenticated: !!user,
        isSuperAdmin: norm === 'SUPER_ADMIN',
        isAdmin: norm === 'ADMIN' || norm === 'SUPER_ADMIN',
        isStandardUser: norm === 'USER',
        login,
        register,
        logout,
        updateUserProfile,
        quickLoginDefault,
        getDashboardRoute
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
