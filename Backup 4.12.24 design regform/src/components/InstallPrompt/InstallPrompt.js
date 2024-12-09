/**
 * @file InstallPrompt.js
 * @description Komponent for å vise en installasjonsmelding for PWA (Progressive Web App).
 * 
 * Hovedfunksjoner:
 * 1. Lytter etter 'beforeinstallprompt'-hendelsen for å detektere når appen kan installeres.
 * 2. Viser en tilpasset installasjonsmelding til brukeren.
 * 3. Håndterer brukerens respons på installasjonsmeldingen.
 * 
 * Komponentstruktur:
 * - useState-hooks for å kontrollere visning av meldingen og lagre installasjonshendelsen.
 * - useEffect-hook for å sette opp og rydde opp event listeners.
 * - Render-funksjon som viser installasjonsmeldingen når det er aktuelt.
 * 
 * Viktig for videre utvikling:
 * - Tilpasse utseendet på installasjonsmeldingen til appens design.
 * - Implementere flerspråklig støtte for installasjonsmeldingen.
 * - Legge til mulighet for å utsette installasjonen og vise meldingen på et senere tidspunkt.
 * - Implementere logging av installasjonsrater og brukerrespons.
 */

import React, { useState, useEffect } from 'react';

// InstallPrompt-komponenten
const InstallPrompt = () => {
  // State for å kontrollere visning av installasjonsmelding
  const [showPrompt, setShowPrompt] = useState(false);
  // State for å lagre installasjonshendelsen
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Funksjon som håndterer 'beforeinstallprompt'-hendelsen
    const handleBeforeInstallPrompt = (e) => {
      // Forhindre at nettleseren viser sin standard installasjonsprompt
      e.preventDefault();
      // Lagre hendelsen så den kan utløses senere
      setDeferredPrompt(e);
      // Oppdater UI for å vise vår egen installasjonsprompt
      setShowPrompt(true);
    };

    // Legg til event listener når komponenten monteres
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fjern event listener når komponenten demonteres
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Funksjon som håndterer klikk på installasjon-knappen
  const handleInstallClick = () => {
    if (deferredPrompt) {
      // Vis installasjonsprompten
      deferredPrompt.prompt();
      // Vent på at brukeren skal svare på prompten
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Bruker aksepterte A2HS prompt');
        } else {
          console.log('Bruker avviste A2HS prompt');
        }
        // Nullstill den lagrede prompten
        setDeferredPrompt(null);
      });
    }
    // Skjul vår egen prompt uansett brukerens valg
    setShowPrompt(false);
  };

  // Ikke vis noe hvis prompten ikke skal vises
  if (!showPrompt) {
    return null;
  }

  // Render installasjonsmeldingen
  return (
    <div className="
      fixed 
      bottom-5 
      left-5 
      right-5 
      bg-gray-100 
      p-4 
      rounded-lg 
      shadow-md 
      z-50
    ">
      <p className="mb-2.5">
        Installer Artregistrerings-appen for enklere tilgang!
      </p>
      <button 
        onClick={handleInstallClick} 
        className="
          bg-green-500 
          text-white 
          px-5 
          py-2.5 
          rounded 
          text-base 
          cursor-pointer 
          hover:bg-green-600 
          transition-colors
        "
      >
        Installer
      </button>
    </div>
  );
};

export default InstallPrompt;