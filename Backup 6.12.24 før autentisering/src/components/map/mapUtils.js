/**
 * @file mapUtils.js
 * @description Utility-funksjoner og konstanter for kartrelaterte operasjoner i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Definerer geografiske grenser for Svalbard
 * 2. Håndterer kategorifarger for ulike artsklassifiseringer
 * 3. Inneholder logikk for geografisk posisjonering og kategorisering
 * 4. Håndterer clustering og overlappende registreringer
 * 
 * Viktige funksjoner:
 * - isInSvalbard: Sjekker om en posisjon er innenfor Svalbards grenser
 * - getCategory: Bestemmer kategori for en registrering basert på posisjon
 * - findOverlappingRegistrations: Identifiserer overlappende registreringer
 * - createClusterCustomIcon: Genererer ikoner for grupperte registreringer
 */

import * as L from 'leaflet';  // Legg til import av Leaflet

// Konstanter for Svalbard-grenser
export const SVALBARD_BOUNDS = {
  south: 74,
  north: 81,
  west: 10,
  east: 35
};

// Hjelpefunksjon for å sjekke om en posisjon er på Svalbard
export const isInSvalbard = (lat, lng) => {
  return lat >= SVALBARD_BOUNDS.south && 
         lat <= SVALBARD_BOUNDS.north && 
         lng >= SVALBARD_BOUNDS.west && 
         lng <= SVALBARD_BOUNDS.east;
};

// Fargekategorier
export const categoryColors = {
  // Rødliste
  CO: '#4D4D4D', // Gått tapt - grå
  CR: '#850000', // Kritisk truet - mørkerød
  EN: '#FF0000', // Sterkt truet - rød
  VU: '#FF4500', // Sårbar - oransjerød
  NT: '#FFA500', // Nær truet - oransje
  DD: '#FFD700', // Datamangel - gul
  LC: '#40E0D0', // Intakt - turkis
  NA: '#808080', // Ikke egnet - grå
  NE: '#808080', // Ikke vurdert - grå
  RE: '#808080', // Regionalt utdødd - grå
  // Fremmede arter
  SE: '#800080', // Svært høy risiko - lilla
  HI: '#000080', // Høy risiko - mørkeblå
  PH: '#008080', // Potensielt høy risiko - turkisblå
  LO: '#40E0D0', // Lav risiko - turkis
  NK: '#9ACD32', // Ingen kjent risiko - gulgrønn
  NR: '#FFFFFF'  // Ikke risikovurdert - hvit
};

export const getCategory = (registration) => {
  const lat = parseFloat(registration.breddegrad);
  const lng = parseFloat(registration.lengdegrad);
  
  let category;
  
  if (registration.species) {
    category = isInSvalbard(lat, lng) ? 
      registration.species['Kategori Svalbard'] : 
      registration.species['Kategori Norge'];
  }
  
  if (!category) {
    category = isInSvalbard(lat, lng) ? 
      registration['Kategori Svalbard'] : 
      registration['Kategori Norge'];
  }
  
  if (!category && registration.artsNavn === 'Fraxinus excelsior') {
    category = 'EN';
  }
  
  return category || 'LC';
};

export const findOverlappingRegistrations = (targetReg, allRegs, map, threshold = 16) => {
  const targetLat = parseFloat(targetReg.breddegrad);
  const targetLng = parseFloat(targetReg.lengdegrad);
  
  return allRegs.filter(reg => {
    if (reg.id === targetReg.id) return true;
    
    const lat = parseFloat(reg.breddegrad);
    const lng = parseFloat(reg.lengdegrad);
    
    const pixelDistance = map.latLngToLayerPoint([targetLat, targetLng])
      .distanceTo(map.latLngToLayerPoint([lat, lng]));
    
    return pixelDistance <= threshold;
  });
};

export const createClusterCustomIcon = (cluster) => {
  const childCount = cluster.getChildCount();
  
  return L.divIcon({
    html: `
      <div style="
        background-color: rgba(0, 120, 255, 0.8);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      ">
        ${childCount}
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: L.point(30, 30, true)
  });
};

