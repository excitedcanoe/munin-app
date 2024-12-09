/**
 * @file LocationActions.js
 * @description Komponent for handlingsknapper relatert til lokalitetsvisning.
 * Inkluderer redigering, sletting og eksport av valgte registreringer.
 * 
 * Hovedfunksjoner:
 * 1. Redigering av valgte registreringer
 * 2. Sletting av valgte registreringer
 * 3. Excel-eksport av valgte registreringer
 * 
 * @param {Object} props
 * @param {Object} props.selectedRegistrations - Valgte registreringer
 * @param {Function} props.onEdit - Handler for redigering
 * @param {Function} props.onDelete - Handler for sletting
 * @param {Object} props.location - Lokalitetsobjekt
 */
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import ExportButton from './ExportButton';

const LocationActions = ({ 
  selectedRegistrations, 
  onEdit, 
  onDelete,
  location 
}) => {
  const hasSelection = Object.values(selectedRegistrations).some(Boolean);

  return (
    <div className="mt-6 flex gap-2">
      <button
        onClick={onEdit}
        disabled={!hasSelection}
        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 
                  disabled:cursor-not-allowed flex items-center hover:bg-blue-600"
      >
        <Edit className="mr-2" size={16} />
        Rediger
      </button>
      <button
        onClick={onDelete}
        disabled={!hasSelection}
        className="px-4 py-2 bg-red-500 text-white rounded-md disabled:opacity-50 
                  disabled:cursor-not-allowed flex items-center hover:bg-red-600"
      >
        <Trash2 className="mr-2" size={16} />
        Slett
      </button>
      <ExportButton 
        selectedRegistrations={selectedRegistrations}
        location={location}
        disabled={!hasSelection}
      />
    </div>
  );
};

export default LocationActions;