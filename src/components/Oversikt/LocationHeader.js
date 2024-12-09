/**
 * @file LocationHeader.js
 * @description Header-komponent for lokalitetsvisning som viser navn, antall registreringer
 * og kontroller for visningstype (liste/kart).
 * 
 * Hovedfunksjoner:
 * 1. Viser lokalitetsnavn og antall registreringer
 * 2. Tilbakeknapp til hovedoversikten
 * 3. Toggle mellom liste- og kartvisning
 * 
 * @param {Object} props
 * @param {string} props.name - Navnet på lokaliteten
 * @param {number} props.registrationCount - Antall registreringer
 * @param {boolean} props.showMap - Om kartvisning er aktiv
 * @param {Function} props.onBack - Handler for tilbakeknapp
 * @param {Function} props.onToggleView - Handler for å bytte visningstype
 */
import React from 'react';
import { ArrowLeft, List, Map } from 'lucide-react';

const LocationHeader = ({ 
  name, 
  registrationCount, 
  showMap, 
  onBack, 
  onToggleView 
}) => {
  return (
    <div className="flex items-center mb-6">
      <button 
        onClick={onBack}
        className="mr-4 p-2 hover:bg-gray-100 rounded-full"
      >
        <ArrowLeft size={24} />
      </button>
      <div>
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-gray-600">
          Registreringer: {registrationCount}
        </p>
      </div>
      <div className="ml-auto">
        <button
          onClick={onToggleView}
          className="p-2 hover:bg-gray-100 rounded-full"
          title={showMap ? "Vis liste" : "Vis kart"}
        >
          {showMap ? <List size={20} /> : <Map size={20} />}
        </button>
      </div>
    </div>
  );
};

export default LocationHeader;