/**
 * @file useRecentLocations.js
 * @description Custom hook for å håndtere historikk over brukte lokaliteter i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Lagrer og henter de 5 sist brukte lokalitetsnavnene fra localStorage
 * 2. Holder orden på rekkefølgen - nyeste lokalitet først
 * 3. Unngår duplikater ved å fjerne eksisterende forekomster når en lokalitet brukes på nytt
 * 4. Håndterer feil som kan oppstå ved lesing/skriving til localStorage
 * 
 * Eksponerte funksjoner:
 * - recentLocations: Array med de siste lokalitetene
 * - addLocation: Funksjon for å legge til en ny lokalitet i historikken
 * 
 * Bruksområde:
 * - Brukes av LocationInput-komponenten for å vise forslag
 * - Kalles fra RegisterForm når en ny registrering lagres
 * 
 * Merk:
 * - Maksimalt 5 lokaliteter lagres
 * - Bruker localStorage for enkel og robust datalagring
 * - Resetter til tom array hvis noe går galt med lagringen
 */
// src/hooks/useRecentLocations.js
import { useState } from 'react';

export const useRecentLocations = () => {
  const [recentLocations, setRecentLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('recentLocations');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading recent locations:', error);
      return [];
    }
  });

  const addLocation = (location) => {
    if (!location) return;
    
    setRecentLocations(prev => {
      const updated = [
        location,
        ...prev.filter(loc => loc !== location)
      ].slice(0, 5);
      
      try {
        localStorage.setItem('recentLocations', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recent locations:', error);
      }
      
      return updated;
    });
  };

  return {
    recentLocations,
    addLocation
  };
};