/**
 * @file useAuth.js
 * @description Custom hook for håndtering av autentisering i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Håndterer brukerautentisering og autorisasjon
 * 2. Administrerer JWT tokens og brukersesjoner
 * 3. Synkroniserer autentiseringsstatus på tvers av faner
 * 4. Tilbyr metoder for login, registrering og utlogging
 * 
 * Bruksmønster:
 * const { 
 *   user,
 *   isLoggedIn,
 *   handleLogin,
 *   handleRegister,
 *   handleLogout
 * } = useAuth();
 */

import { useState, useCallback, useEffect } from 'react';
import { authApi } from '../services/authApi';

export const useAuth = () => {
  // State
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = authApi.getAuthToken();
        if (token) {
          const profile = await authApi.getProfile();
          setUser(profile);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        authApi.logout();  // Clear invalid token
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login handler
  const handleLogin = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(email, password);
      if (response.user) {
        setUser(response.user);
        setIsLoggedIn(true);
        return { success: true, user: response.user };
      }
      throw new Error('Invalid response format');
    } catch (err) {
      setError(err.message);
      return { 
        success: false, 
        error: err.message || 'Innlogging mislyktes' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register handler
  const handleRegister = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: newUser } = await authApi.register(userData);
      setUser(newUser);
      setIsLoggedIn(true);
      return { success: true, user: newUser };
    } catch (err) {
      setError(err.message);
      return { 
        success: false, 
        error: err.message || 'Registrering mislyktes'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setIsLoggedIn(false);
    setError(null);
  }, []);

  return {
    user,
    isLoggedIn,
    isLoading,
    error,
    handleLogin,
    handleRegister,
    handleLogout
  };
};

export default useAuth;