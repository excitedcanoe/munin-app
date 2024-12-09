/**
 * @file LoadingIndicator.js
 * @description Komponent for å vise en lastindikator under innlasting av artsdata.
 * 
 * Hovedfunksjoner:
 * 1. Viser en visuell indikator for pågående datainnlasting.
 * 2. Gir brukeren tilbakemelding om fremdriften i innlastingsprosessen.
 * 3. Posisjonert diskret i nedre venstre hjørne av skjermen.
 * 
 * Komponentstruktur:
 * - Container: En semi-transparent boks som inneholder indikatoren.
 * - Tekstmelding: Informerer brukeren om at artsdata lastes inn.
 * - Fremdriftsindikator: Viser prosentvis fremdrift av innlastingen.
 * 
 * Viktig for videre utvikling:
 * - Vurdere å legge til animasjoner for en mer dynamisk visuell tilbakemelding.
 * - Implementere mulighet for å vise mer detaljert statusinformasjon.
 * - Tilpasse utseendet for ulike skjermstørrelser og orienteringer.
 * - Legge til mulighet for å avbryte innlastingen eller vise estimert gjenværende tid.
 */

import React from 'react';

function LoadingIndicator({ isLoading, progress }) {
  if (!isLoading) return null;

  return (
    <div className="fixed bottom-5 left-5 bg-overlay p-2.5 rounded-md text-white z-modal">
      <p>Laster artsdata</p>
      <progress value={progress} max="100" className="w-full"></progress>
    </div>
  );
}

export default LoadingIndicator;