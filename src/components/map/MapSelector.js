/**
 * @file MapSelector.js
 * @description Komponent for å velge en posisjon på kartet i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Lytter til 'moveend'-hendelser på kartet.
 * 2. Rapporterer den nye sentrumsposisjonen til kartet når det flyttes.
 * 
 * Komponentstruktur:
 * - Bruker useMapEvents-hooken fra react-leaflet for å lytte til karthendelser.
 * - Returnerer null da komponenten ikke har noen visuell representasjon.
 * 
 * Viktig for videre utvikling:
 * - Vurdere å legge til flere hendelseslyttere for mer avansert kartinteraksjon.
 * - Implementere debouncing for å redusere antall unødvendige oppdateringer ved raske kartbevegelser.
 * - Legge til feilhåndtering for tilfeller der kartdata ikke kan hentes.
 */

import { useMapEvents } from 'react-leaflet';

const MapSelector = ({ onSelect }) => {
  // Bruk useMapEvents-hooken for å lytte til karthendelser
  const map = useMapEvents({
    // Når kartet slutter å bevege seg, rapporter den nye sentrumsposisjonen
    moveend: () => {
      const center = map.getCenter();
      onSelect({ lat: center.lat, lng: center.lng });
    },
  });

  // Komponenten har ingen visuell representasjon, så vi returnerer null
  return null;
};

export default MapSelector;