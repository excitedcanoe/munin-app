/**
 * @file BottomUI.js
 * @description Komponent for den nedre delen av brukergrensesnittet i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Viser en "Lokaliser meg"-knapp for å sentrere kartet på brukerens posisjon.
 * 2. Viser en "Registrer"-knapp for å åpne registreringsskjemaet.
 * 
 * Komponentstruktur:
 * - Container: Posisjonerer UI-elementene nederst til høyre på skjermen.
 * - Lokaliser-knapp: Rund knapp med LocateFixed-ikon.
 * - Registrer-knapp: Rektangulær knapp med tekst.
 * 
 * Viktig for videre utvikling:
 * - Implementere responsivt design for ulike skjermstørrelser.
 * - Legge til flere funksjonsknapper etter behov.
 * - Vurdere å implementere en mer dynamisk knappstruktur basert på brukerrettigheter eller app-tilstand.
 */

import { Locate, LocateFixed, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useDevice } from '../../hooks/useDevice';

const BottomUI = ({ handleLocateMe, handleButtonClick, activeButton, isTracking }) => {
  const { isMobile } = useDevice();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Touch handlers bare for mobile enheter
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isMobile) return;
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !touchStart || !touchEnd) return;
    
    const swipeDistance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (swipeDistance > minSwipeDistance) {
      handleButtonClick('Registrer', true);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="absolute bottom-4 right-4 flex flex-col items-end gap-4 pointer-events-auto">
      {/* Lokaliseringsknapp - nå over registreringsknappen */}
      <button
        onClick={handleLocateMe}
        className={`
          w-12
          h-12
          rounded-full 
          ${isTracking ? 'bg-blue-50' : 'bg-white'} 
          flex 
          justify-center 
          items-center 
          cursor-pointer 
          shadow-lg
          hover:bg-opacity-90
          transition-colors
        `}
      >
        {isTracking ? (
          <LocateFixed className="text-blue-700" />
        ) : (
          <Locate className="text-blue-500" />
        )}
      </button>

      {/* Registreringsknapp */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative"
      >
        <button
          onClick={() => handleButtonClick('Registrer')}
          className={`
            w-16
            h-16
            rounded-full 
            bg-[#005e5d]
            flex 
            justify-center 
            items-center 
            cursor-pointer
            shadow-lg
            hover:opacity-90
            transition-all
            transform hover:scale-105
            ${activeButton === 'Registrer' ? 'opacity-90' : ''}
          `}
        >
          <Plus className="text-white" size={28} />
        </button>
      </div>
    </div>
  );
};

export default BottomUI;