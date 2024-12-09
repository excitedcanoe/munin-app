/**
 * @file LocationInput.js
 * @description Komponent for inndata av lokalitetsnavn i registreringsskjemaet.
 * 
 * Hovedfunksjoner:
 * 1. Viser input-felt for navn på lokalitet
 * 2. Implementerer "lås"-funksjonalitet som lar brukeren låse verdien for flere registreringer
 * 3. Viser dropdown med de 5 sist brukte lokalitetene når feltet får fokus
 * 4. Filtrerer forslagene basert på det brukeren skriver
 * 
 * Funksjonalitet:
 * - Autoforslag basert på tidligere brukte lokaliteter
 * - Fuzzy-søk i forslagene mens brukeren skriver
 * - Låsbar verdi med Lock/Unlock-ikon
 * - Validering av obligatorisk felt (markert med *)
 * 
 * Props:
 * - formData: Objekt med skjemadata
 * - setFormData: Funksjon for å oppdatere skjemadata
 * - lockedFields: Objekt som holder styr på låste felt
 * - toggleLock: Funksjon for å låse/låse opp felt
 * 
 * Styling:
 * - Responsivt design
 * - Dropdown med skygge og avrundede hjørner
 * - Tydelig visuell tilbakemelding på interaksjon
 * 
 * Merk:
 * - Bruker useRecentLocations hook for å håndtere forslag
 * - Hindrer nettleserens innebygde autoforslag med autoComplete="off"
 * - Håndterer edge-case der forslag forsvinner før klikk registreres
 */

// src/components/forms/LocationInput.js
import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useRecentLocations } from '../../hooks/useRecentLocations';

const LocationInput = ({ 
  formData, 
  setFormData, 
  lockedFields, 
  toggleLock 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const { recentLocations } = useRecentLocations();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (location) => {
    setFormData(prevData => ({
      ...prevData,
      navnPaLokalitet: location
    }));
    setShowSuggestions(false);
  };

  return (
    <div className="mb-4 relative">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="navnPaLokalitet">
          Navn på lokalitet*
        </label>
        <button 
          onClick={() => toggleLock('navnPaLokalitet')}
          className="bg-transparent border-none cursor-pointer p-1 hover:opacity-80"
        >
          {lockedFields.navnPaLokalitet ? 
            <Lock className="w-4.5 h-4.5" /> : 
            <Unlock className="w-4.5 h-4.5" />
          }
        </button>
      </div>
      
      <div className="relative">
        <input 
          type="text" 
          id="navnPaLokalitet" 
          name="navnPaLokalitet"
          value={formData.navnPaLokalitet || ''}
          onChange={handleInputChange}
          onFocus={() => {
            setInputFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setInputFocused(false);
              setShowSuggestions(false);
            }, 200);
          }}
          className="w-full p-2 rounded border border-gray-300"
          autoComplete="off"
        />
        
        {showSuggestions && inputFocused && recentLocations.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 shadow-md z-50">
            {recentLocations
              .filter(location => 
                location.toLowerCase().includes((formData.navnPaLokalitet || '').toLowerCase())
              )
              .map((location, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(location)}
                  className={`
                    p-3 
                    cursor-pointer 
                    hover:bg-gray-50
                    ${index < recentLocations.length - 1 ? 'border-b border-gray-200' : ''}
                  `}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {location}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationInput;