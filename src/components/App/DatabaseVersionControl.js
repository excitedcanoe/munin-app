/**
 * @file DatabaseVersionControl.js
 * @description Komponent for å administrere og oppdatere artsdatabasen i appen.
 * 
 * Hovedfunksjoner:
 * 1. Viser gjeldende versjon av artsdatabasen og totalt antall arter.
 * 2. Tilbyr funksjonalitet for å sjekke og utføre oppdateringer av databasen.
 * 3. Gir mulighet for å tvinge gjennom en full oppdatering av databasen.
 * 4. Viser en fremdriftsindikator under oppdateringsprosessen.
 * 
 * Komponentstruktur:
 * - Informasjonsvisning: Viser gjeldende versjon og antall arter.
 * - Oppdateringsknapper: For å sjekke oppdateringer og tvinge gjennom oppdatering.
 * - Fremdriftsindikator: Viser status og prosent fullført under oppdatering.
 * - Statusmelding: Informerer brukeren om resultatet av oppdateringsprosessen.
 * 
 * Viktig for videre utvikling:
 * - Implementere mer robust feilhåndtering og gjenopprettingsfunksjonalitet.
 * - Legge til loggføring av oppdateringshistorikk.
 * - Optimalisere oppdateringsprosessen for store datasett.
 * - Implementere funksjonalitet for å rulle tilbake til tidligere versjoner ved behov.
 */

import React, { useState, useEffect } from 'react';
import { getCurrentDataVersion, checkAndUpdateData, forceUpdateData, getSpeciesCount } from '../../utils/speciesDatabase';

const DatabaseVersionControl = () => {
  const [currentVersion, setCurrentVersion] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [speciesCount, setSpeciesCount] = useState(0);
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    fetchCurrentVersion();
    fetchSpeciesCount();
  }, []);

  const fetchCurrentVersion = async () => {
    const version = await getCurrentDataVersion();
    setCurrentVersion(version || 'Ikke satt');
  };

  const fetchSpeciesCount = async () => {
    const count = await getSpeciesCount();
    setSpeciesCount(count);
  };

  const handleCheckUpdate = async () => {
    setIsUpdating(true);
    setUpdateStatus('Sjekker for oppdateringer...');
    try {
      await checkAndUpdateData((progress) => {
        setUpdateProgress(progress);
        setUpdateStatus(`Oppdaterer: ${progress.toFixed(2)}% fullført`);
      });
      setUpdateStatus('Oppdatering fullført');
    } catch (error) {
      console.error('Feil under oppdateringssjekk:', error);
      setUpdateStatus('En feil oppstod under oppdatering. Vennligst prøv igjen.');
    } finally {
      setIsUpdating(false);
      fetchCurrentVersion();
      fetchSpeciesCount();
    }
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    setUpdateStatus('Tvinger gjennom oppdatering...');
    try {
      await forceUpdateData((progress) => {
        setUpdateProgress(progress);
        setUpdateStatus(`Tvungen oppdatering: ${progress.toFixed(2)}% fullført`);
      });
      setUpdateStatus('Tvungen oppdatering fullført');
    } catch (error) {
      console.error('Feil under tvungen oppdatering:', error);
      setUpdateStatus('En feil oppstod under tvungen oppdatering. Vennligst prøv igjen.');
    } finally {
      setIsUpdating(false);
      fetchCurrentVersion();
      fetchSpeciesCount();
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Databaseversjonskontroll</h2>
      <p className="mb-2">Gjeldende versjon: {currentVersion}</p>
      <p className="mb-4">Totalt antall arter: {speciesCount}</p>
      <div className="space-y-2">
        <button 
          onClick={handleCheckUpdate} 
          disabled={isUpdating}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Sjekk for oppdateringer
        </button>
        <button 
          onClick={handleForceUpdate} 
          disabled={isUpdating}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Tving gjennom oppdatering
        </button>
      </div>
      {isUpdating && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${updateProgress}%` }}
            />
          </div>
        </div>
      )}
      <p className="mt-4 text-sm text-gray-600">{updateStatus}</p>
    </div>
  );
};

export default DatabaseVersionControl;