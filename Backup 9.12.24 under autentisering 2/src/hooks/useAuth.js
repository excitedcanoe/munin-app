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
  // Grunnleggende auth-state
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sjekk autentiseringsstatus ved oppstart
  useEffect(() => {
    const initializeAuth = async () => {
      // Kommentér ut dette foreløpig
    /*try {
      if (authApi.isAuthenticated()) {
        const profile = await authApi.getProfile();
        setUser(profile);
        setIsLoggedIn(true);
      }
    } catch (error) {*/
      // For nå, start alltid i utlogget tilstand
      authApi.logout();
      setUser(null);
      setIsLoggedIn(false);
      setIsLoading(false);
    /*}*/
    };

    initializeAuth();
  }, []);

  // Login-håndtering med validering og feilhåndtering
  const handleLogin = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(email, password);
      
      // La oss logge hele responsen
      console.log('Login response in handleLogin:', response);
      
      // Sjekk om vi har user-data i responsen
      if (response.user) {
        setUser(response.user);
        setIsLoggedIn(true);
        return { success: true };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.message || 'Innlogging mislyktes' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Registrering av nye brukere
  const handleRegister = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      const { user: newUser } = await authApi.register(userData);
      
      setUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.message || 'Registrering mislyktes' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Utlogging og opprydding av brukerdata
  const handleLogout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
  }, []);

  // Eksporter auth-relaterte metoder og tilstand
  return {
    user,
    isLoggedIn,
    isLoading,
    handleLogin,
    handleRegister,
    handleLogout
  };
};

export default useAuth;