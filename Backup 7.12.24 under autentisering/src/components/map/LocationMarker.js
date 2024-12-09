/**
 * @file LocationMarker.js
 * @description Komponent som viser brukerens posisjon på kartet i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Viser en blå sirkelmarkør for brukerens posisjon på kartet.
 * 2. Zoomer kartet til brukerens posisjon når det er nødvendig.
 * 
 * Komponentstruktur:
 * - useMap-hook: Gir tilgang til Leaflet-kartobjektet.
 * - useEffect: Håndterer zoomfunksjonalitet basert på props.
 * - CircleMarker: Visuell representasjon av brukerens posisjon.
 * 
 * Viktig for videre utvikling:
 * - Implementere animasjon for markøren for å indikere nøyaktighet eller bevegelse.
 * - Legge til mulighet for å vise retning hvis enheten støtter det.
 * - Vurdere å implementere sporing av brukerens bevegelse over tid.
 * - Optimalisere ytelsen ved hyppige posisjonsoppdateringer.
 */

import React, { useEffect, useRef } from 'react';
import { useMap, CircleMarker } from 'react-leaflet';

const LocationMarker = ({ location, shouldZoom, onZoomComplete, isTracking }) => {
  const map = useMap();
  const zoomRef = useRef(shouldZoom);
  const hasUserInteractedRef = useRef(false);

  useEffect(() => {
    console.log('LocationMarker: isTracking changed:', isTracking);
  }, [isTracking]);

  useEffect(() => {
    zoomRef.current = shouldZoom;
  }, [shouldZoom]);

  // Reset user interaction when tracking is activated
  useEffect(() => {
    if (isTracking) {
      console.log('LocationMarker: Resetting user interaction state');
      hasUserInteractedRef.current = false;
    }
  }, [isTracking]);

  // Handle map position updates
  useEffect(() => {
    if (location && isTracking && !hasUserInteractedRef.current) {
      console.log('LocationMarker: Updating map position');
      map.setView(location, map.getZoom(), {
        animate: true,
        duration: 1
      });
    }
  }, [location, isTracking, map]);

  // Handle initial zoom
  useEffect(() => {
    if (location && zoomRef.current) {
      map.flyTo(location, 17, {
        duration: 1,
        easeLinearity: 0.25,
      });
      onZoomComplete();
    }
  }, [location, map, onZoomComplete]);

  // Alltid vis markøren når vi har en lokasjon
  return location ? (
    <CircleMarker 
      center={location}
      radius={8}
      fillColor="#4285F4"
      fillOpacity={1}
      stroke={false}
    />
  ) : null;
};

export default LocationMarker;