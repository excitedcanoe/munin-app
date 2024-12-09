/**
 * @file LocationTable.js
 * @description Tabell-komponent for visning av registreringer i en lokalitet.
 * Håndterer visning av registreringsdata, bildevisning og artsinfo.
 * 
 * Hovedfunksjoner:
 * 1. Viser registreringer i tabellformat
 * 2. Håndterer valg av registreringer
 * 3. Viser thumbnails og åpner bildevisning
 * 4. Viser artsinfo i popup
 * 
 * @param {Object} props
 * @param {Object} props.location - Lokalitetsobjekt med registreringer
 * @param {Object} props.selectedRegistrations - Valgte registreringer
 * @param {Function} props.onSelectionChange - Handler for endring i valg
 * @param {Function} props.onSpeciesClick - Handler for klikk på artsnavn
 * @param {Function} props.onImageClick - Handler for klikk på bilder
 * @param {Function} props.onMapPin - Handler for klikk på kartmarkør
 */
import React from 'react';
import { MapPin, Target, Calendar, Clock, Camera } from 'lucide-react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('no', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).replace(/\//g, '.');
};

const LocationTable = ({
  location,
  selectedRegistrations,
  onSelectionChange,
  onSpeciesClick,
  onImageClick,
  onMapPin
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full [border-spacing:0_8px] [border-collapse:separate]">
        <colgroup>
          <col className="w-10" />
          <col className="w-[300px]" />
          <col className="w-[100px]" />
          <col className="w-[100px]" />
          <col className="w-[100px]" />
          <col className="w-[100px]" />
          <col className="w-[60px]" />
          <col className="w-[200px]" />
        </colgroup>
        <thead>
          <tr>
            <th className="px-6 py-3">
              <input 
                type="checkbox"
                onChange={(e) => {
                  const value = e.target.checked;
                  const newSelection = Object.keys(location.registreringer).reduce((acc, key) => {
                    acc[key] = value;
                    return acc;
                  }, {});
                  onSelectionChange(newSelection);
                }}
                checked={Object.keys(location.registreringer).every(
                  key => selectedRegistrations[key]
                )}
                className="w-4 h-4"
              />
            </th>
            <th className="px-6 py-3 text-left">Art</th>
            <th className="px-6 py-3 text-center">
              <MapPin size={16} className="inline" title="Koordinater" />
            </th>
            <th className="px-6 py-3 text-center">
              <Target size={16} className="inline" title="Nøyaktighet (m)" />
            </th>
            <th className="px-6 py-3 text-center">
              <Calendar size={16} className="inline" title="Dato" />
            </th>
            <th className="px-6 py-3 text-center">
              <Clock size={16} className="inline" title="Tid" />
            </th>
            <th className="px-6 py-3 text-center">
              <Camera size={16} className="inline" title="Bilde" />
            </th>
            <th className="px-6 py-3 text-left">Kommentar</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(location.registreringer).map(([regKey, reg]) => (
            <tr 
              key={regKey}
              data-registration-id={reg.id}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-3 text-center">
                <input 
                  type="checkbox"
                  checked={selectedRegistrations[regKey] || false}
                  onChange={(e) => onSelectionChange({ 
                    ...selectedRegistrations, 
                    [regKey]: e.target.checked 
                  })}
                  className="w-4 h-4"
                />
              </td>
              <td className="px-6 py-3">
                <button 
                  onClick={(e) => onSpeciesClick(reg.species, e)}
                  className="text-left hover:text-blue-500 focus:outline-none"
                >
                  {reg.species?.VernacularNameBokmaal || reg.artsNavn}
                </button>
              </td>
              <td className="px-6 py-3 text-center">
                <button 
                  onClick={(e) => onMapPin(reg, e)}
                  className="text-blue-500 hover:text-blue-700"
                  title={`${reg.breddegrad}, ${reg.lengdegrad}`}
                >
                  <MapPin size={16} className="inline cursor-pointer" />
                </button>
              </td>
              <td className="px-6 py-3 text-center">
                {reg.noyaktighet ? `${reg.noyaktighet}m` : 'N/A'}
              </td>
              <td className="px-6 py-3 text-center">{formatDate(reg.date)}</td>
              <td className="px-6 py-3 text-center">{reg.time || '-'}</td>
              <td className="px-6 py-3 text-center">
                {reg.images && reg.images.length > 0 && (
                  <div className="relative inline-block">
                    <button
                      onClick={() => onImageClick(reg.images, reg.id)}
                      className="p-1 hover:bg-gray-100 rounded-full inline-flex"
                    >
                      <Camera size={16} />
                      {reg.images.length > 1 && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                          {reg.images.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </td>
              <td className="px-6 py-3">
                {reg.comment || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LocationTable;