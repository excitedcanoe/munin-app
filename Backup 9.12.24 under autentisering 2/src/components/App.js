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

import { Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useCallback } from 'react';
import { useAppState } from '../hooks/useAppState';  
import { checkAndUpdateData } from '../utils/speciesDatabase';  
import AppInterface from './AppInterface/AppInterface';  
import AuthForm from './auth/AuthForm'; 
import InstallPrompt from './InstallPrompt/InstallPrompt';  
import LoadingIndicator from './App/LoadingIndicator';  
import 'leaflet/dist/leaflet.css';

function App() {
  const { 
    isInitialLoadComplete,
    loadProgress,
    setIsInitialLoadComplete,
    setLoadProgress,
    user
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
        // TODO: Implementer brukervenlig feilhåndtering
      } finally {
        setIsInitialLoadComplete(true);
      }
    }

    if (user) {
      initializeData();  // Laster data etter at brukeren har logget inn
    }
  }, [setIsInitialLoadComplete, handleLoadProgress, user]);

  return (
    <div className="App h-screen w-screen overflow-hidden">
      <Routes>
        <Route path="/auth" element={
          !user ? <AuthForm /> : <Navigate to="/" />
        } />
        <Route path="/" element={
          user ? (
            <>
              <AppInterface />
              <LoadingIndicator isLoading={!isInitialLoadComplete} progress={loadProgress} />
              <InstallPrompt />
            </>
          ) : <Navigate to="/auth" />
        } />
      </Routes>
    </div>
  );
}

export default App;