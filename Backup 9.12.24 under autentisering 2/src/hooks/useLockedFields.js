/**
 * @file useLockedFields.js
 * @description Custom hook for å håndtere låste felt i registreringsskjemaet
 * 
 * Hovedfunksjoner:
 * - Lagrer låste verdier i localStorage
 * - Håndterer låsing/opplåsing av felt
 * - Henter lagrede verdier for låste felt
 */

import { useState, useCallback } from 'react';

/**
 * @hook useLockedFields
 * Håndterer tilstand og lagring for låste felt
 */
export const useLockedFields = () => {
  /**
   * @state lockedFields
   * Initialiseres fra localStorage eller med standardverdier
   */
  const [lockedFields, setLockedFields] = useState(() => {
    try {
      const saved = localStorage.getItem('lockedFields');
      return saved ? JSON.parse(saved) : {
        date: false,
        noyaktighet: false,
        navnPaLokalitet: false
      };
    } catch {
      return {
        date: false,
        noyaktighet: false,
        navnPaLokalitet: false
      };
    }
  });

  /**
   * @function toggleLock
   * @param {string} field - Feltet som skal låses/låses opp
   * @param {object} formData - Nåværende skjemadata
   * 
   * Håndterer:
   * - Toggling av låsetilstand
   * - Lagring i localStorage
   * - Spesialtilfelle for dato/tid
   */
  const toggleLock = useCallback((field, formData) => {
    setLockedFields(prev => {
      const newLockedFields = { ...prev, [field]: !prev[field] };
      localStorage.setItem('lockedFields', JSON.stringify(newLockedFields));

      if (newLockedFields[field]) {
        if (field === 'date') {
          // Datofelt krever lagring av både dato og tid
          localStorage.setItem('lockedDate', formData.date);
          localStorage.setItem('lockedTime', formData.time);
        } else {
          // Andre felt lagres direkte
          localStorage.setItem(
            `locked${field.charAt(0).toUpperCase() + field.slice(1)}`, 
            formData[field]
          );
        }
      }

      return newLockedFields;
    });
  }, []);

  /**
   * @function getLockedValue
   * @param {string} field - Feltet vi vil hente verdi for
   * Henter lagret verdi for et låst felt
   */
  const getLockedValue = useCallback((field) => {
    if (field === 'date') {
      return {
        date: localStorage.getItem('lockedDate'),
        time: localStorage.getItem('lockedTime')
      };
    }
    return localStorage.getItem(`locked${field.charAt(0).toUpperCase() + field.slice(1)}`);
  }, []);

  return {
    lockedFields,
    toggleLock,
    getLockedValue
  };
};

export default useLockedFields;