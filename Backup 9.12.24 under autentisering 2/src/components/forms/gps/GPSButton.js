/**
 * @file GPSButton.js
 * @description Komponent for GPS-funksjonalitet i registreringsskjemaet.
 * 
 * Hovedfunksjoner:
 * 1. Viser nåværende GPS-status med fargekoding.
 * 2. Håndterer aktivering/deaktivering av GPS-sporing.
 * 3. Kommuniserer med useRegistrationLocation hook for posisjonering.
 * 
 * Komponentstruktur:
 * - Knapp med statusindikator
 * - Integrert MapPin-ikon
 * - Dynamisk statusmelding
 * 
 * Viktig for videre utvikling:
 * - Implementere bedre feilhåndtering for GPS-tilgang
 * - Legge til støtte for høydenivå
 * - Forbedre presisjonsindikator
 */

import React from 'react';
import { MapPin } from 'lucide-react';
import { useRegistrationLocation } from '../../../hooks/location/useRegistrationLocation';

const GPSButton = ({ onPositionSelected }) => {
  const {
    getBorderColor,
    getStatusText,
    toggleGPS
  } = useRegistrationLocation({
    onLocationSelected: onPositionSelected
  });

  // Konverterer getBorderColor() til Tailwind-klasser
  const getBorderClass = () => {
    const color = getBorderColor();
    switch (color) {
      case '#ff0000': return 'border-red-500';
      case '#00ff00': return 'border-green-500';
      case '#ffA500': return 'border-orange-400';
      default: return 'border-gray-300';
    }
  };

  return (
    <button 
      onClick={toggleGPS}
      className={`
        flex-1 
        p-2 
        bg-gray-100 
        border-2 
        ${getBorderClass()} 
        rounded 
        flex 
        items-center 
        justify-center 
        cursor-pointer 
        mr-2 
        transition-colors 
        duration-300 
        hover:bg-gray-200
      `}
    >
      <MapPin className="w-4 h-4 mr-2" />
      <span>{getStatusText()}</span>
    </button>
  );
};

export default GPSButton;