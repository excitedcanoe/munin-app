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

import React, { useState } from 'react';
import StepperForm from '../forms/StepperForm';

const RegisterOverlay = ({
  onClose,
  selectedCoordinates,
  onSelectInMap,
  onSave,
  formData,
  setFormData
}) => {
  const [selectedImages, setSelectedImages] = useState([]);

  const handleReset = () => {
    setFormData({
      speciesInput: '',
      artsNavn: '',
      date: '',
      time: '',
      breddegrad: '',
      lengdegrad: '',
      navnPaLokalitet: '',
      noyaktighet: '',
      comment: ''
    });
    setSelectedImages([]);
  };

  return (
    <div className="pointer-events-auto">
      <StepperForm
        onClose={onClose}
        selectedCoordinates={selectedCoordinates}
        onSelectInMap={onSelectInMap}
        onSave={onSave}
        formData={formData}
        setFormData={setFormData}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        onReset={handleReset}  // LEGGES TIL
      />
    </div>
  );
};

export default RegisterOverlay;