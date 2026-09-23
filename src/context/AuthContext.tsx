import React, { createContext, useContext } from 'react';
import { useSchool } from './SchoolContext';
import { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: any;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, login, logout } = useSchool();
  
  const value = {
    user: currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth ត្រូវតែប្រើប្រាស់នៅខាងក្នុង <AuthProvider>');
  }
  return context;
};
