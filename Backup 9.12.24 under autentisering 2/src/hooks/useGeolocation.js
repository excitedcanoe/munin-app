/**
 * @file useGeolocation.js
 * @description Custom hook for å håndtere geolokasjon i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Sjekker om geolokasjon er tilgjengelig i nettleseren.
 * 2. Henter brukerens nåværende posisjon.
 * 3. Håndterer feil relatert til geolokasjon.
 * 4. Tilbyr en funksjon for å oppdatere posisjonen.
 * 
 * Struktur:
 * - State-variabler: Holder brukerens posisjon og eventuelle feil.
 * - useEffect-hook: Initialiserer geolokasjonen ved første render.
 * - Hjelpefunksjoner: Sjekker tilgjengelighet og oppdaterer posisjon.
 * 
 * Når skal man bruke denne hooken?
 * - Når man trenger brukerens nåværende posisjon i en komponent.
 * - Når man vil tilby funksjonalitet basert på brukerens lokasjon.
 * 
 * Viktig for videre utvikling:
 * - Vurdere å legge til støtte for kontinuerlig sporing av posisjon.
 * - Implementere caching av sist kjente posisjon for raskere initial lasting.
 * - Legge til flere feilmeldinger for ulike scenarier (f.eks. tidssavbrudd, nøyaktighetsproblemer).
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export const useGeolocation = (options = {}, isTracking = false) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  
  const defaultOptions = useMemo(() => ({
    enableHighAccuracy: true,
    maximumAge: 1000,
    timeout: 5000,
    minimumDistance: 1
  }), []);

  const mergedOptions = useMemo(() => ({
    ...defaultOptions,
    ...options
  }), [defaultOptions, options]);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }, []);

  const handlePositionUpdate = useCallback((position) => {
    console.log('🌍 useGeolocation: Got new position update', {
      tracking: isTracking,
      watchId: watchIdRef.current
    });

    const newPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp
    };

    setLocation(prevLocation => {
      if (!prevLocation) {
        console.log('🌍 useGeolocation: Setting initial position');
        return newPosition;
      }

      const distance = calculateDistance(
        prevLocation.lat,
        prevLocation.lng,
        newPosition.lat,
        newPosition.lng
      );

      if (distance >= mergedOptions.minimumDistance) {
        console.log('🌍 useGeolocation: Position updated - distance exceeded minimum', {
          distance,
          minimum: mergedOptions.minimumDistance
        });
        return newPosition;
      }
      
      console.log('🌍 useGeolocation: Position ignored - too close to previous');
      return prevLocation;
    });
  }, [calculateDistance, mergedOptions.minimumDistance, isTracking]);

  const handleError = useCallback((error) => {
    const errorMessages = {
      1: 'Ingen tillatelse til å bruke posisjon',
      2: 'Kunne ikke hente posisjon',
      3: 'Forespørselen tok for lang tid'
    };
    setError(errorMessages[error.code] || 'Ukjent posisjonsfeil');
    console.error('🚫 Geolocation error:', error);
  }, []);

  const startWatching = useCallback(() => {
    console.log('🌍 useGeolocation: Starting watch');
    if (!navigator.geolocation) {
      setError('Geolokasjon støttes ikke av nettleseren din');
      return;
    }

    if (watchIdRef.current) {
      console.log('🌍 useGeolocation: Clearing existing watch:', watchIdRef.current);
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handleError,
      mergedOptions
    );
    console.log('🌍 useGeolocation: New watch started:', watchIdRef.current);
  }, [handlePositionUpdate, handleError, mergedOptions]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current) {
      console.log('🌍 useGeolocation: Stopping watch:', watchIdRef.current);
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const updateLocation = useCallback(() => {
    console.log('🌍 useGeolocation: Requesting single position update');
    if (!navigator.geolocation) {
      setError('Geolokasjon støttes ikke av nettleseren din');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handlePositionUpdate,
      handleError,
      mergedOptions
    );
  }, [handlePositionUpdate, handleError, mergedOptions]);

  useEffect(() => {
    if (isTracking) {
      console.log('🌍 useGeolocation: Starting tracking mode');
      updateLocation();
      startWatching();
    } else {
      console.log('🌍 useGeolocation: Stopping tracking mode');
      stopWatching();
    }

    return () => {
      if (watchIdRef.current) {
        console.log('🌍 useGeolocation: Cleanup - stopping watch:', watchIdRef.current);
        stopWatching();
      }
    };
  }, [isTracking, updateLocation, startWatching, stopWatching]);

  return {
    location,
    error,
    updateLocation,
    startWatching,
    stopWatching
  };
};

export default useGeolocation;