/**
 * @file GPSNotification.js
 * @description Komponent for å vise GPS-relaterte varsler til brukeren.
 * 
 * Hovedfunksjoner:
 * 1. Viser midlertidige varselmeldinger relatert til GPS-status
 * 2. Automatisk lukking av varsler etter en gitt tid
 * 3. Støtter ulike typer varsler med konsistent styling
 * 
 * Komponentstruktur:
 * - Varselcontainer med animasjon
 * - Varselikon og melding
 * - Automatisk tidsstyrt lukking
 * 
 * Viktig for videre utvikling:
 * - Implementere ulike varseltyper (success, warning, error)
 * - Legge til støtte for manuell lukking
 * - Køhåndtering for multiple varsler
 */

import React, { useEffect } from 'react';

const GPSNotification = ({ message, onClose }) => {
  // Timer-logikk forblir uendret
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="
      fixed 
      bottom-5 
      left-1/2 
      transform 
      -translate-x-1/2 
      bg-red-500 
      text-white 
      px-6 
      py-3 
      rounded 
      shadow-md 
      z-50 
      flex 
      items-center 
      gap-2
      animate-fade-in
    ">
      <span>⚠️</span>
      {message}
    </div>
  );
};

export default GPSNotification;