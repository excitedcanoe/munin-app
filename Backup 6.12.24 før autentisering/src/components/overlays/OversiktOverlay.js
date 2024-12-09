/**
 * @file OversiktOverlay.js
 * @description Komponent for å vise oversikt over registreringer i et overlay.
 * 
 * Hovedfunksjoner:
 * Overlay-filene fungerer som "wrappere" rundt hovedkomponentene 
 * og gir dem en semi-transparent bakgrunn og sentrert posisjonering. 
 * 1. Viser en liste over alle registreringer.
 * 2. Tillater lukking av oversikten ved klikk utenfor innholdet.
 * 3. Muliggjør valg av en spesifikk lokasjon for mer detaljert visning.
 * 
 * Props:
 * @param {Array} registrations - Liste over alle registreringer
 * @param {Function} onClose - Funksjon for å lukke oversikten
 * @param {Function} onSelectLocation - Funksjon for å velge en spesifikk lokasjon
 * 
 * Lukke/Tilbake funksjonalitet:
 * - Overlay-et kan lukkes ved å klikke utenfor innholdsboksen.
 * - Dette implementeres ved å lytte på klikk-eventer på overlay-elementet
 *   og sjekke om klikket skjedde direkte på overlay-et (ikke på innholdet).
 */

import React from 'react';
import Oversikt from '../Oversikt/Oversikt';

const OversiktOverlay = ({ 
  registrations, 
  onClose, 
  onSelectLocation,
  setMapCenter,
  setActiveButton
}) => {
  return (
    <div 
      className="
        absolute 
        inset-0 
        bg-black/50 
        flex 
        justify-center 
        items-center 
        pointer-events-auto
        z-40
      "
      onClick={(e) => {
        if (e.target.classList.contains('bg-black/50')) {
          onClose();
        }
      }}
    >
      <div className="
        bg-white 
        p-8 
        rounded-lg 
        w-[90%] 
        h-[90%] 
        max-w-4xl 
        overflow-auto
      ">
        <Oversikt 
          registrations={registrations}
          onClose={onClose}
          onSelectLocation={onSelectLocation}
          setMapCenter={setMapCenter}
          setActiveButton={setActiveButton}
        />
      </div>
    </div>
  );
};

export default OversiktOverlay;