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
        <label htmlFor="noyaktighet" className="text-gray-700">
          Nøyaktighet i meter*
        </label>
        <button 
          onClick={() => toggleLock('noyaktighet')}
          className="bg-transparent border-none cursor-pointer hover:opacity-80"
        >
          {lockedFields.noyaktighet ? <Lock className="w-4.5 h-4.5" /> : <Unlock className="w-4.5 h-4.5" />}
        </button>
      </div>
      
      <div className="relative">
        <div
          onClick={() => setIsNoyaktighetOpen(!isNoyaktighetOpen)}
          className="
            w-full 
            p-2 
            rounded 
            border 
            border-gray-300 
            bg-white 
            cursor-pointer 
            text-base 
            flex 
            justify-between 
            items-center
            hover:border-gray-400
          "
        >
          <span>{formData.noyaktighet ? `${formData.noyaktighet} m` : 'Velg nøyaktighet'}</span>
          <span className="text-xs">▼</span>
        </div>
        
        {isNoyaktighetOpen && (
          <ul className="
            absolute 
            top-full 
            left-0 
            right-0 
            max-h-52 
            overflow-y-auto 
            bg-white 
            border 
            border-gray-300 
            border-t-0 
            rounded-b 
            shadow-lg 
            z-50
          ">
            {noyaktighetsAlternativer.map((alt) => (
              <li
                key={alt}
                onClick={() => handleNoyaktighetChange(alt)}
                className="
                  p-2 
                  cursor-pointer 
                  border-b 
                  border-gray-100
                  hover:bg-gray-50
                  last:border-b-0
                "
              >
                {alt} m
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AccuracyInput;