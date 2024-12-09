/**
 * @file TopUI.js
 * @description Komponent for den øvre delen av brukergrensesnittet i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Viser en menyknapp for å åpne sidepanelet.
 * 2. Viser en "Oversikt"-knapp for å åpne oversiktsskjermen.
 * 
 * Komponentstruktur:
 * - Container: Posisjonerer UI-elementene øverst på skjermen.
 * - Menyknapp: Rund knapp med Menu-ikon, vises kun når sidepanelet er lukket.
 * - Oversikt-knapp: Rektangulær knapp med tekst.
 * 
 * Viktig for videre utvikling:
 * - Implementere responsivt design for ulike skjermstørrelser.
 * - Legge til flere funksjonsknapper eller informasjonselementer etter behov.
 * - Vurdere å implementere en mer dynamisk knappstruktur basert på brukerrettigheter eller app-tilstand.
 */

import React from 'react';
import { Menu } from 'lucide-react';

const TopUI = ({ isSidePanelOpen, setIsSidePanelOpen, activeButton, handleButtonClick }) => {
  return (
    <div className="flex justify-between items-center p-4 pointer-events-auto">
      {!isSidePanelOpen && (
        <div 
          onClick={() => setIsSidePanelOpen(true)}
          className="
            w-10 
            h-10 
            rounded-full 
            bg-white 
            flex 
            justify-center 
            items-center 
            cursor-pointer
            hover:bg-gray-100
            transition-colors
            shadow-lg
            border border-gray-200
          "
        >
          <Menu className="text-gray-600" size={24} />
        </div>
      )}
      
      <button
        onClick={() => handleButtonClick('Oversikt')}
        className={`
          px-4 
          py-2
          ${activeButton === 'Oversikt' 
            ? 'bg-gray-200 text-gray-800' 
            : 'bg-white text-gray-600'}
          rounded-full
          text-base 
          shadow-md 
          cursor-pointer
          hover:bg-gray-100
          transition-colors
          border border-gray-200
        `}
      >
        Oversikt
      </button>
    </div>
  );
};

export default TopUI;