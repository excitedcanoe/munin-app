/**
 *
 * @file RegistrationSubmit.js
 * @description Håndterer validering og innsending av artsregistrering

 * Hovedfunksjoner:
 * 1. Viser en knapp for å lagre registreringen.
 * 2. Håndterer klikk-hendelser og trigger lagringsfunksjonen.
 * 
 * Komponentstruktur:
 * - Knapp: Viser "Lagre" tekst og utløser lagringsfunksjonen ved klikk.
 * 
 * Viktig for videre utvikling:
 * - Implementere visuell tilbakemelding under lagringsprosessen (f.eks. en spinner).
 * - Legge til mulighet for å deaktivere knappen basert på skjemaets gyldighet.
 * - Implementere bekreftelsesdialog før lagring for å unngå utilsiktede innsendinger.
 * - Vurdere å legge til støtte for hurtigtaster (f.eks. Ctrl+S) for lagring.
 * - Implementere feilhåndtering og visuell tilbakemelding ved lagringsfeil.
 */

import React from 'react';

/**
 * @function validateRegistration
 * @description Sjekker om alle påkrevde felt er utfylt
 */
const validateRegistration = (formData) => {
  const requiredFields = {
    speciesInput: "Artsnavn",
    date: "Dato",
    breddegrad: "Breddegrad",
    lengdegrad: "Lengdegrad",
    navnPaLokalitet: "Navn på lokalitet",
    noyaktighet: "Nøyaktighet"
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([key]) => !formData[key])
    .map(([, label]) => label);

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * @component RegistrationSubmit
 * @description Submit-knapp med validering og formatering av data
 */
const RegistrationSubmit = ({ formData, selectedImages, onSave, onClose, onReset }) => {
  const handleSubmit = () => {
    const { isValid, missingFields } = validateRegistration(formData);
    
    if (!isValid) {
      alert(`Vennligst fyll ut følgende påkrevde felt: ${missingFields.join(", ")}`);
      return;
    }

    const registrationData = {
      ...formData,
      images: selectedImages.map(img => img.preview)
    };

    console.log('Saving registration with images:', registrationData);
    onSave(registrationData);
    onReset();
    onClose();
  };

  return (
    <div className="text-center">
      <button 
        onClick={handleSubmit}
        className="
          px-8 
          py-3 
          bg-green-500 
          text-white 
          rounded 
          cursor-pointer 
          text-base
          hover:bg-green-600
          transition-colors
          duration-200
        "
      >
        Lagre
      </button>
    </div>
  );
};

export default RegistrationSubmit;