/**
 * @file AccuracyInput.js
 * @description Komponent for valg av nøyaktighet i meter for observasjonen.
 * 
 * Hovedfunksjoner:
 * 1. Viser en nedtrekksliste med forhåndsdefinerte nøyaktighetsverdier.
 * 2. Tillater brukeren å velge nøyaktighet for observasjonen.
 * 3. Håndterer låsing og opplåsing av nøyaktighetsfeltet.
 * 4. Oppdaterer skjemadata ved endringer i valgt nøyaktighet.
 * 
 * Komponentstruktur:
 * - Label: Viser feltets navn og indikerer at det er obligatorisk.
 * - Nedtrekksliste: Viser tilgjengelige nøyaktighetsverdier.
 * - Låseknapp: Toggles låsing/opplåsing av feltet.
 * 
 * Viktig for videre utvikling:
 * - Implementere en mer dynamisk måte å generere nøyaktighetsverdier på.
 * - Legge til mulighet for brukeren å angi en egendefinert nøyaktighetsverdi.
 * - Implementere visuell representasjon av nøyaktigheten (f.eks. en sirkel på et kart).
 * - Vurdere å legge til hjelpetekst eller tooltips for å forklare betydningen av ulike nøyaktighetsverdier.
 * - Optimalisere ytelsen ved håndtering av lange lister med nøyaktighetsverdier.
 */

import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';

const AccuracyInput = ({ formData, setFormData, lockedFields, toggleLock }) => {
  const [isNoyaktighetOpen, setIsNoyaktighetOpen] = useState(false);

  const noyaktighetsAlternativer = [
    '1', '5', '10', '25', '50', '75', '100', '125', '150', '200', '250', 
    '300', '400', '500', '750', '1000', '1500', '2000', '2500', '3000', '5000'
  ];

  const handleNoyaktighetChange = (value) => {
    setFormData(prevData => ({
      ...prevData,
      noyaktighet: value
    }));
    setIsNoyaktighetOpen(false);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-gray-700">Nøyaktighet i meter*</label>
        <button 
          onClick={() => toggleLock('noyaktighet')}
          className="bg-transparent border-none cursor-pointer hover:opacity-80"
        >
          {lockedFields.noyaktighet ? <Lock className="w-4.5 h-4.5" /> : <Unlock className="w-4.5 h-4.5" />}
        </button>
      </div>
      
      <div className="relative">
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {noyaktighetsAlternativer.map((verdi) => (
              <button
                key={verdi}
                onClick={() => setFormData(prev => ({...prev, noyaktighet: verdi}))}
                className={`
                  px-4 
                  py-2 
                  rounded-full 
                  border 
                  whitespace-nowrap
                  ${formData.noyaktighet === verdi 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'}
                `}
              >
                {verdi} m
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccuracyInput;