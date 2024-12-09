/**
 * @file RegisterOverlay.js
 * @description Komponent for å vise registreringsskjema i et overlay.
 * 
 * Hovedfunksjoner:
 * 1. Viser et skjema for å registrere nye observasjoner.
 * 2. Tillater lukking av skjemaet ved klikk utenfor innholdet.
 * 3. Håndterer interaksjon med kartet for valg av posisjon.
 * 
 * Props:
 * @param {Function} onClose - Funksjon for å lukke skjemaet
 * @param {Object} mapCenter - Sentrum av kartet
 * @param {Object} selectedCoordinates - Valgte koordinater
 * @param {Function} onSelectInMap - Funksjon for å velge posisjon i kartet
 * @param {Function} onSave - Funksjon for å lagre registreringen
 * @param {Object} formData - Data i registreringsskjemaet
 * @param {Function} setFormData - Funksjon for å oppdatere skjemadata
 * 
 * Lukke/Tilbake funksjonalitet:
 * - Overlay-et kan lukkes ved å klikke utenfor skjemaet.
 * - Dette implementeres ved å lytte på klikk-eventer på overlay-elementet
 *   og sjekke om klikket skjedde direkte på overlay-et (ikke på skjemaet).
 * 
 * Viktig for videre utvikling:
 * - Implementere validering av skjemadata før lagring.
 * - Legge til mulighet for å lagre uferdige registreringer som utkast.
 * - Vurdere å implementere stegvis registrering for komplekse observasjoner.
 */

import React from 'react';
import RegisterForm from '../forms/RegisterForm';

const RegisterOverlay = ({ 
  onClose, 
  mapCenter, 
  selectedCoordinates, 
  onSelectInMap, 
  onSave, 
  formData, 
  setFormData 
}) => {
  return (
    // Overlay container
     // Lukk skjemaet hvis klikket skjer direkte på overlay-et
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
      {/* Innholdsboks */}
      <div className="
        bg-white 
        p-8 
        rounded-lg 
        w-[90%] 
        h-[90%] 
        max-w-4xl 
        overflow-auto
      ">
        {/* RegisterForm-komponenten */}
        <RegisterForm 
          onClose={onClose}
          mapCenter={mapCenter}
          selectedCoordinates={selectedCoordinates}
          onSelectInMap={onSelectInMap}
          onSave={onSave}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
    </div>
  );
};

export default RegisterOverlay;