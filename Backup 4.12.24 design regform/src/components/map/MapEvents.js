/**
 * @file MapEvents.js
 * @description Komponent for å håndtere karthendelser i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Lytter til 'moveend'-hendelser på kartet og oppdaterer kartets senter.
 * 2. Håndterer klikk på kartet for å nullstille valgt registrering.
 * 
 * Komponentstruktur:
 * - Bruker useMapEvents-hooken fra react-leaflet for å lytte til karthendelser.
 * - Returnerer null da komponenten ikke har noen visuell representasjon.
 * 
 * Viktig for videre utvikling:
 * - Vurdere å legge til flere hendelseslyttere for mer avansert kartinteraksjon.
 * - Implementere debouncing for å redusere antall unødvendige oppdateringer ved raske kartbevegelser.
 * - Legge til logging eller analyse av brukerinteraksjoner med kartet.
 */

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useAppState } from '../../hooks/useAppState';

const MapEvents = () => {
  const map = useMap();
  const { setIsTracking, isTracking } = useAppState();

  useEffect(() => {
    if (!map) return;

    const handleUserInteraction = (e) => {
      // Bare reagere på faktiske brukerinteraksjoner
      if (e.originalEvent && isTracking) {
        console.log('MapEvents: Deactivating tracking due to user interaction');
        setIsTracking(false);
      }
    };

    // Lytt direkte på container-elementet
    const container = map.getContainer();
    container.addEventListener('mousedown', handleUserInteraction, { passive: true });
    container.addEventListener('touchstart', handleUserInteraction, { passive: true });

    return () => {
      container.removeEventListener('mousedown', handleUserInteraction);
      container.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [map, setIsTracking, isTracking]);

  return null;
};

export default MapEvents;