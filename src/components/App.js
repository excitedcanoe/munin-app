/**
 * @file App.js
 * @description Hovedkomponent for artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Håndterer innlasting av artsdata og initialisering av applikasjonen.
 * 2. Styrer visning av enten brukergrensesnittet eller påloggingsskjermen basert på autentiseringsstatus.
 * 3. Viser en lastindikator under den initielle datainnlastingen.
 * 4. Inkluderer en installasjonspromt for progressive web app-funksjonalitet.
 * 
 * Komponentstruktur:
 * - AppInterface: Hovedbrukergrensesnittet for innloggede brukere.
 * - AuthForm: Påloggingsskjerm for ikke-autentiserte brukere.
 * - LoadingIndicator: Viser fremdrift under innlasting av artsdata.
 * - InstallPrompt: Prompt for installasjon av appen som en PWA.
 * 
 * Viktig for videre utvikling:
 * - Håndtering av feil under datainnlasting og visning av feilmeldinger til brukeren.
 * - Optimalisering av datainnlastingsprosessen for raskere oppstart.
 * - Implementering av offline-funksjonalitet og synkronisering av data.
 * - Utvidelse av PWA-funksjonalitet for bedre brukeropplevelse på mobile enheter.
 */

/**
 * @file App.js
 * @description Hovedkomponent for artsregistreringsappen.
 */

import React, { useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';  
import { useAppState } from '../hooks/useAppState'; 
import { checkAndUpdateData } from '../utils/speciesDatabase';  
import AppInterface from './AppInterface/AppInterface';  
import AuthForm from './auth/AuthForm'; 
import InstallPrompt from './InstallPrompt/InstallPrompt';  
import LoadingIndicator from './App/LoadingIndicator';  
import 'leaflet/dist/leaflet.css';

function App() {
  const { user } = useAuth();
  const { 
    isInitialLoadComplete,
    loadProgress,
    setIsInitialLoadComplete,
    setLoadProgress,
  } = useAppState();

  const handleLoadProgress = useCallback((progress) => {
    setLoadProgress(progress);
  }, [setLoadProgress]);

  useEffect(() => {
    async function initializeData() {
      setIsInitialLoadComplete(false);
      try {
        await checkAndUpdateData(handleLoadProgress);
      } catch (error) {
        console.error('Feil ved initialisering av database:', error);
      } finally {
        setIsInitialLoadComplete(true);
      }
    }

    if (user) {
      initializeData();
    }
  }, [user, setIsInitialLoadComplete, handleLoadProgress]);

  return (
    <div className="App h-screen w-screen overflow-hidden">
      <style>
        {`
          .leaflet-container {
            z-index: 0;
            width: 100%;
            height: 100%;
          }
        `}
      </style>

      {user ? (
        <>
          <AppInterface />
          <LoadingIndicator isLoading={!isInitialLoadComplete} progress={loadProgress} />
          <InstallPrompt />
        </>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}

export default App;