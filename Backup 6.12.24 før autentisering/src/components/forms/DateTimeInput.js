/**
 * @file DateTimeInput.js
 * @description Komponent for inndata av dato og tid i registreringsskjemaet.
 * 
 * Hovedfunksjoner:
 * 1. Tillater manuell inntasting av dato og tid via input-felt.
 * 2. Tilbyr hurtigvalg for dato (nå, i dag, i går).
 * 3. Håndterer formatering av dato og tid.
 * 4. Oppdaterer skjemadata ved endringer i dato eller tid.
 * 5. Respekterer låste felter for dato.
 * 
 * Komponentstruktur:
 * - Hurtigvalgknapper: For rask setting av dato (nå, i dag, i går).
 * - Datoinput: For manuell inntasting av dato.
 * - Tidsinput: For manuell inntasting av tid.
 * 
 * Viktig for videre utvikling:
 * - Implementere en mer avansert datovelger med kalendervisning.
 * - Legge til støtte for ulike datoformater basert på brukerens lokale innstillinger.
 * - Implementere validering for å sikre at valgt dato/tid ikke er i fremtiden.
 * - Legge til funksjonalitet for å velge tidsperioder eller datointervaller.
 * - Vurdere å implementere en tidssone-velger for mer nøyaktig tidregistrering.
 * - Optimalisere ytelsen ved håndtering av mange datoer i store datasett.
 */


import React from 'react';

const DateTimeInput = ({ formData, setFormData, lockedFields }) => {
  React.useEffect(() => {
    if (!formData.date) {  // Kun sett hvis dato ikke allerede er satt
      handleDateShortcut('now');
    }
  }, []); // Kjører kun når komponenten monteres

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDateShortcut = (shortcut) => {
    if (lockedFields?.date) return; // Hvis datoen er låst, gjør ingenting

    const now = new Date();
    let date, time;

    switch (shortcut) {
      case 'now':
        date = formatDate(now);
        time = formatTime(now);
        break;
      case 'today':
        date = formatDate(now);
        time = '';
        break;
      case 'yesterday':
        const yesterday = new Date(now.setDate(now.getDate() - 1));
        date = formatDate(yesterday);
        time = '';
        break;
      default:
        return;
    }

    setFormData(prevData => ({
      ...prevData,
      date,
      time,
      selectedTimeOption: shortcut || 'now'
    }));
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const formatTime = (date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700">Dato for funnet*</label>
      <div className="flex justify-between mb-2">
        <button 
          onClick={() => handleDateShortcut('now')} 
          className={`
            flex-1 
            p-2 
            ${formData.selectedTimeOption === 'now' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} 
            border 
            border-gray-300 
            rounded-l-md 
            cursor-pointer
            hover:bg-opacity-90
            transition-colors
          `}>
          Nå
        </button>
        <button 
          onClick={() => handleDateShortcut('today')} 
          className={`
            flex-1 
            p-2 
            ${formData.selectedTimeOption === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} 
            border-t 
            border-b 
            border-gray-300 
            cursor-pointer
            hover:bg-opacity-90
            transition-colors
          `}>
          I dag
        </button>
        <button 
          onClick={() => handleDateShortcut('yesterday')} 
          className={`
            flex-1 
            p-2 
            ${formData.selectedTimeOption === 'yesterday' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} 
            border 
            border-gray-300 
            rounded-r-md 
            cursor-pointer
            hover:bg-opacity-90
            transition-colors
          `}>
          I går
        </button>
      </div>
      
      <div className="flex justify-between space-x-4">
        <div className="flex-1">
          <input 
            type="date" 
            name="date"
            value={formData.date || ''}
            onChange={handleInputChange}
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
          <input 
            type="time" 
            id="tidspunkt" 
            name="time"
            value={formData.time || ''}
            onChange={handleInputChange}
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

export default DateTimeInput;