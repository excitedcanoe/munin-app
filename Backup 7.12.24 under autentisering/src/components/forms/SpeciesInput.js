/**
 * @file SpeciesInput.js
 * @description Komponent for inndata og søk av arter i registreringsskjemaet.
 * 
 * Hovedfunksjoner:
 * 1. Tillater brukeren å søke etter og velge arter.
 * 2. Viser forslag basert på brukerens input.
 * 3. Lagrer og viser nylig brukte arter.
 * 4. Integrerer mulighet for bildeopplasting av arten.
 * 
 * Komponentstruktur:
 * - Input-felt: For inntasting av artsnavn.
 * - Forslagsliste: Viser matchende arter basert på input.
 * - Kameraknapp: For å ta bilde eller velge bilde fra enheten.
 * - Nylig brukte arter: Vises når input-feltet er tomt.
 * 
 * Viktig for videre utvikling:
 * - Optimalisere søkefunksjonaliteten for bedre ytelse ved store datasett.
 * - Implementere mer avansert filtrering og sortering av forslag.
 * - Legge til mulighet for å vise mer detaljert informasjon om hver art.
 * - Implementere caching av søkeresultater for å redusere serverbelastning.
 * - Vurdere å legge til støtte for offline-søk av vanlige arter.
 * - Forbedre håndtering av nettverksfeil under søk.
 */

import React, { useState, useEffect } from 'react';
import { searchSpecies } from '../../utils/speciesDatabase';

const SpeciesInput = ({ formData, setFormData }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [recentSpecies, setRecentSpecies] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const storedRecentSpecies = localStorage.getItem('recentSpecies');
    if (storedRecentSpecies) {
      setRecentSpecies(JSON.parse(storedRecentSpecies));
    }
  }, []);

  const handleSpeciesInputChange = async (e) => {
    const value = e.target.value;
    console.log(`Input value changed to: "${value}"`);
    setFormData(prevData => ({
      ...prevData,
      speciesInput: value,
      artsNavn: value
    }));
    
    if (value.length > 2) {
      try {
        console.log(`Searching for: "${value}"`);
        const searchResults = await searchSpecies(value);
        console.log(`Search results:`, searchResults);
        setSuggestions(searchResults);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching species:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (species) => {
    // Lagrer all relevant artsdata i formData
    setFormData(prevData => ({
      ...prevData,
      speciesInput: species.commonNameNorwegian || species.scientificName,
      artsNavn: species.scientificName,
      categoryNorway: species.categoryNorway,
      categorySvalbard: species.categorySvalbard,
      species: species, // Lagrer hele artsobjektet
      genusName: species.Genus,
      speciesName: species.Species,
      vernacularName: species.VernacularNameBokmaal
    }));
    
    console.log('Selected species data:', species); // Debug
    setSuggestions([]);
    setShowSuggestions(false);

    const updatedRecentSpecies = [species, ...recentSpecies.filter(s => s.id !== species.id)].slice(0, 5);
    setRecentSpecies(updatedRecentSpecies);
    localStorage.setItem('recentSpecies', JSON.stringify(updatedRecentSpecies));
  };

  return (
    <div className="mb-4">
      <label 
        htmlFor="artsnavn" 
        className="block mb-2 text-gray-700"
      >
        Artsnavn*
      </label>
      <div className="relative flex items-center">
        <input
          type="text" 
          id="artsnavn" 
          name="speciesInput"
          value={formData.speciesInput || ''}
          onChange={handleSpeciesInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="
            w-full 
            p-2 
            rounded 
            border 
            border-gray-300 
            focus:border-blue-500 
            focus:outline-none 
            focus:ring-1 
            focus:ring-blue-500
          "
          autoComplete="off"
        />
        {showSuggestions && (suggestions.length > 0 || (formData.speciesInput?.length === 0 && recentSpecies.length > 0)) && (
          <ul className="
            absolute 
            top-full 
            left-0 
            w-full 
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
            {(formData.speciesInput?.length === 0 ? recentSpecies : suggestions).map((species) => (
              <li 
                key={species.id}
                onClick={() => handleSuggestionClick(species)}
                className="
                  p-2 
                  cursor-pointer 
                  border-b 
                  border-gray-200 
                  hover:bg-gray-50
                  last:border-b-0
                "
              >
                <span>{species.commonNameNorwegian}</span>
                <span className="ml-2 italic text-gray-600">
                  ({species.scientificName})
                </span>
                {(species.categoryNorway || species.categorySvalbard) && (
                  <span className="
                    ml-2 
                    px-2 
                    py-0.5 
                    rounded 
                    text-xs 
                    bg-gray-100
                  ">
                    {species.categoryNorway || species.categorySvalbard}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SpeciesInput;