/**
 * @file SearchComponent.js
 * @description Komponent for å søke etter arter i artsdatabasen.
 * 
 * Hovedfunksjoner:
 * 1. Tilbyr et søkefelt for brukeren å skrive inn artsnavn.
 * 2. Håndterer søkeforespørsler og viser resultater.
 * 3. Viser en lastindikator mens søket pågår.
 * 4. Presenterer søkeresultatene i en liste, eller en melding hvis ingen resultater ble funnet.
 * 
 * Komponentstruktur:
 * - Søkeskjema: Inneholder input-felt og søkeknapp.
 * - Lastindikator: Vises mens søket pågår.
 * - Resultatliste: Viser matchende arter med norsk navn (hvis tilgjengelig) og vitenskapelig navn.
 * - Statusmelding: Vises hvis ingen resultater ble funnet.
 * 
 * Viktig for videre utvikling:
 * - Implementere autofullføring eller forslag mens brukeren skriver.
 * - Legge til avanserte søkealternativer (f.eks. filtrering etter habitat eller bevaringsstatus).
 * - Optimalisere søkelogikken for raskere resultater ved store datasett.
 * - Implementere paginering eller "last mer" funksjonalitet for store resultatsett.
 * - Forbedre feilhåndtering og gi mer detaljert tilbakemelding ved søkefeil.
 */

import React, { useCallback, useState } from 'react';
import { useAppState } from '../../hooks/useAppState';

function SearchComponent() {
  const { searchQuery, setSearchQuery, searchResults, handleSearch } = useAppState();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setIsLoading(true);
    handleSearch(searchQuery)
      .then(results => {
        console.log('Søkeresultater i komponenten:', results);
      })
      .catch(error => {
        console.error('Søkefeil:', error);
        // TODO: Implementer brukervenlig feilhåndtering
      })
      .finally(() => setIsLoading(false));
  }, [handleSearch, searchQuery]);

  return (
    <div className="search-component">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Søk etter art"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Søker...' : 'Søk'}
        </button>
      </form>
      {isLoading && <p>Laster resultater...</p>}
      {!isLoading && searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map((result) => (
            <li key={result.id || result.scientificName}>
              {result.commonNameNorwegian && <span className="common-name">{result.commonNameNorwegian}</span>}
              <span className="scientific-name">{result.scientificName}</span>
            </li>
          ))}
        </ul>
      )}
      {!isLoading && searchQuery && searchResults.length === 0 && (
        <p className="no-results">Ingen resultater funnet for "{searchQuery}"</p>
      )}
    </div>
  );
}

export default SearchComponent;