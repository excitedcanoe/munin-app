/**
 * @file CrosshairOverlay.js
 * @description Komponent som viser et sikte-ikon over kartet i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Viser et sikte-ikon i sentrum av kartet.
 * 2. Hjelper brukeren med å velge en nøyaktig posisjon på kartet.
 * 
 * Komponentstruktur:
 * - Div-container: Posisjonerer siktet i midten av skjermen.
 * - Crosshair-ikon: Visuell representasjon av siktet.
 * 
 * Viktig for videre utvikling:
 * - Vurdere å gjøre ikonets farge og størrelse konfigurerbar via props.
 * - Implementere animasjoner for å gjøre siktet mer synlig eller interaktivt.
 * - Legge til mulighet for å skjule/vise siktet basert på app-tilstand.
 */

import React from 'react';
import { Crosshair } from 'lucide-react';

const CrosshairOverlay = () => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
    <Crosshair className="text-red-500" size={24} />
  </div>
);

export default CrosshairOverlay;