/**
 * @file CoordinateInput.js
 * @description Komponent for inndata og visning av koordinater i registreringsskjemaet.
 * 
 * Hovedfunksjoner:
 * 1. Støtter både lat/long og UTM-koordinatsystemer.
 * 2. Konverterer automatisk mellom lat/long og UTM ved inntasting.
 * 3. Tillater brukeren å veksle mellom koordinatsystemer.
 * 4. Oppdaterer skjemadata ved endringer i koordinatene.
 * 
 * Komponentstruktur:
 * - Koordinatsystem-velger: Knapp for å veksle mellom lat/long og UTM.
 * - Input-felter: For inntasting av koordinater (Nord/Sør og Øst/Vest eller Northing/Easting).
 * - Konverteringsfunksjonalitet: Bruker proj4 biblioteket for å konvertere mellom koordinatsystemer.
 * 
 * Viktig for videre utvikling:
 * - Implementere validering av koordinater for å sikre at de er innenfor gyldige områder.
 * - Legge til støtte for flere koordinatsystemer og UTM-soner.
 * - Implementere en kartvisning for visuell representasjon av koordinatene.
 * - Forbedre brukergrensesnittet for enklere inntasting av koordinater, f.eks. med auto-formatering.
 * - Legge til funksjonalitet for å hente koordinater fra enhetens GPS.
 * - Optimalisere ytelsen ved konvertering av koordinater for store datasett.
 */

import React from 'react';

const CoordinateInput = ({ formData, setFormData }) => {
  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between space-x-4">
        <div className="flex-1">
          <label 
            htmlFor="breddegrad" 
            className="block mb-1 text-gray-700"
          >
            Nord
          </label>
          <input 
            type="text" 
            id="breddegrad"
            name="breddegrad"
            value={formData.breddegrad || ''}
            onChange={handleCoordinateChange}
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
          />
        </div>
        <div className="flex-1">
          <label 
            htmlFor="lengdegrad" 
            className="block mb-1 text-gray-700"
          >
            Øst
          </label>
          <input 
            type="text" 
            id="lengdegrad"
            name="lengdegrad"
            value={formData.lengdegrad || ''}
            onChange={handleCoordinateChange}
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
          />
        </div>
      </div>
    </div>
  );
};

export default CoordinateInput;