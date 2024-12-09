/**
 * @file useRegistrationLocation.js
 * @description Custom hook for GPS og lokasjonshåndtering i registreringsskjemaet
 * 
 * Hovedfunksjoner:
 * - GPS-sporing og presisjonshåndtering
 * - Statusfarger basert på GPS-nøyaktighet
 * - Tekstmeldinger for GPS-status
 */

import { useState, useCallback, useEffect } from 'react';
import useGeolocation from '../useGeolocation';

/**
 * @hook useRegistrationLocation
 * @param {function} onLocationSelected - Callback når posisjon velges
 * @param {object} initialCoordinates - Startkordinater (valgfritt)
 */
export const useRegistrationLocation = ({ 
  onLocationSelected, 
  initialCoordinates = null 
}) => {
  /** 
   * @state GPS-tilstander
   * isWatching: Om GPS aktivt sporer
   * precisionLevel: Nøyaktighetsnivå (high/medium/low)
   */
  const [isWatching, setIsWatching] = useState(false);
  const [precisionLevel, setPrecisionLevel] = useState(null);
  
  /**
   * @hook useGeolocation
   * Håndterer selve GPS-funksjonaliteten
   */
  const { location, error, startWatching, stopWatching } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  });

  /**
   * @effect Presisjonshåndtering
   * Setter nøyaktighetsnivå basert på GPS-presisjon:
   * - Høy: ≤ 10m
   * - Medium: ≤ 20m
   * - Lav: > 20m
   */
  useEffect(() => {
    if (location?.accuracy) {
      if (location.accuracy <= 10) setPrecisionLevel('high');
      else if (location.accuracy <= 20) setPrecisionLevel('medium');
      else setPrecisionLevel('low');
    }
  }, [location]);

  /**
   * @function toggleGPS
   * Starter/stopper GPS-sporing og håndterer posisjonsvalg
   */
  const toggleGPS = useCallback(() => {
    if (!isWatching) {
      setIsWatching(true);
      startWatching();
    } else {
      if (location) {
        onLocationSelected({
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy
        });
      }
      setIsWatching(false);
      stopWatching();
    }
  }, [isWatching, location, onLocationSelected, startWatching, stopWatching]);

  /**
   * @function UI-hjelpere
   * getBorderColor: Farge basert på GPS-presisjon
   * getAccuracyText: Formattert nøyaktighetstekst
   * getStatusText: Brukervennlig statusmelding
   */
  const getBorderColor = useCallback(() => {
    if (!isWatching) return '#ccc';
    switch (precisionLevel) {
      case 'high': return '#22c55e';    // Grønn = Bra
      case 'medium': return '#eab308';   // Gul = OK
      case 'low': return '#ef4444';      // Rød = Dårlig
      default: return '#ccc';
    }
  }, [isWatching, precisionLevel]);

  const getAccuracyText = useCallback(() => {
    if (!location?.accuracy) return '';
    return `±${Math.round(location.accuracy)}m`;
  }, [location]);

  const getStatusText = useCallback(() => {
    if (error) return `GPS-feil: ${error}`;
    if (isWatching) return `Venter på GPS ${getAccuracyText()}`;
    return 'Min nåværende posisjon';
  }, [error, isWatching, getAccuracyText]);

  return {
    isWatching,
    location,
    error,
    precisionLevel,
    getBorderColor,
    getStatusText,
    toggleGPS,
    coordinates: location ? {
      lat: location.lat,
      lng: location.lng
    } : initialCoordinates
  };
};