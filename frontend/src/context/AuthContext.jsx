import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        // If an admin somehow has a stored session in this app, clear it
        if (parsed.role === 'ADMIN') {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        } else {
          setUser(parsed);
        }
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    const response = await authAPI.login(identifier, password);
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Fetch fresh profile to get live isMember status
    try {
      const profileRes = await userAPI.getProfile();
      const freshUser = { ...userData, ...profileRes.data };
      localStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser);
      return freshUser;
    } catch {
      return userData;
    }
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (role) => user?.role === role;
  const isLibrarian = () => user?.role === 'LIBRARIAN';
  const isFaculty = () => user?.role === 'FACULTY' || user?.role === 'LIBRARIAN';
  const isStudent = () => user?.role === 'STUDENT' || user?.role === 'FACULTY' || user?.role === 'LIBRARIAN';

  const value = {
    user,
    login,
    register,
    logout,
    hasRole,
    isLibrarian,
    isFaculty,
    isStudent,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
