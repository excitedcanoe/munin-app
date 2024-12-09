/**
 * @file RegistrationMarker.js
 * @description Komponent for visning av enkeltregistreringer på kartet.
 * 
 * Hovedfunksjoner:
 * 1. Viser markør for hver registrering med korrekt fargekoding
 * 2. Håndterer buffer-visning for nøyaktighetsindikering
 * 3. Implementerer utvidet hit box for bedre touch-interaksjon
 * 4. Håndterer popup-visning ved klikk
 * 
 * Props:
 * @param {Object} registration - Registreringsobjekt med all nødvendig info
 * @param {Object} map - Leaflet kartobjekt
 * @param {Function} onSelect - Callback ved valg av registrering
 * @param {Array} registrations - Alle registreringer for overlapp-sjekk
 * @param {Boolean} clearBuffer - Trigger for å fjerne buffer
 * 
 * Nøkkelkomponenter:
 * - Custom divIcon for bedre touch-område
 * - Buffer-sirkel for nøyaktighetsvisning
 * - Popup med registreringsdetaljer
 * 
 * 
 * Styling-strategi:
 * Denne komponenten bruker inline styles fordi:
 * 1. Markør-ikoner krever dynamisk CSS-generering basert på kategorifarger
 * 2. Leaflet's divIcon API krever styling som string-templates
 * 3. Dynamisk posisjonering og transformasjoner er kritiske for markørplassering
 * 
 * Spesifikke styling-valg:
 * - divIcon: Bruker inline styles for presis kontroll over markør-utseende
 * - Circle: Bruker Leaflet's native styling-system for buffer-visning
 * - Transformasjoner: Håndteres direkte i style-strings for best ytelse
 */

import React, { useState, useEffect } from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import * as L from 'leaflet';
import { categoryColors, getCategory, findOverlappingRegistrations } from './mapUtils';
import PopupContent from './PopupContent';

const RegistrationMarker = React.memo(({ registration, map, onSelect, registrations, clearBuffer }) => {
  const [showBuffer, setShowBuffer] = useState(false);
  const category = getCategory(registration);
  const color = categoryColors[category];

  // Sikre presis konvertering av koordinater
  const lat = Number(parseFloat(registration.breddegrad).toFixed(6));
  const lng = Number(parseFloat(registration.lengdegrad).toFixed(6));
  const position = [lat, lng];

  useEffect(() => {
    if (clearBuffer) {
      setShowBuffer(false);
    }
  }, [clearBuffer]);

  const handleClick = (e) => {
    L.DomEvent.stopPropagation(e);
    if (onSelect) {
      onSelect(registration);
    }
    setShowBuffer(true);
  };

  const markerIcon = L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        transform-origin: center;
      ">
        <div style="
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background-color: ${color};
          border: 1px solid black;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'registration-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],  // Presis sentrering
    popupAnchor: [0, -12]
  });

  return (
    <>
      {showBuffer && (
        <Circle
          center={position}
          radius={parseFloat(registration.noyaktighet)}
          pathOptions={{ 
            color: '#000000',
            fillColor: color,
            fillOpacity: 0.2,
            weight: 1,
            dashArray: '5, 5'
          }}
        />
      )}
      <Marker
        position={position}
        icon={markerIcon}
        eventHandlers={{
          click: handleClick
        }}
        // Legg til ekstra props for bedre posisjonering
        zIndexOffset={1000}  // Sikre at markøren er over andre elementer
        pane="markerPane"    // Bruk riktig kartlag
      >
        <Popup onClose={() => setShowBuffer(false)}>
          <PopupContent 
            registrations={map ? findOverlappingRegistrations(registration, registrations, map) : [registration]}
            onSelect={onSelect}
          />
        </Popup>
      </Marker>
    </>
  );
});

export default RegistrationMarker;