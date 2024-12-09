/**
 * @file Oversikt.js
 * @description Hovedkomponent for visning og administrering av registreringer.
 * Koordinerer visning av lokaliteter og deres registreringer.
 * 
 * Hovedfunksjoner:
 * - Oversikt over alle lokaliteter
 * - Detaljert visning av enkeltlokaliteter
 * - Administrering av registreringer (velge, slette, eksportere)
 * 
 * Komponentstruktur:
 * - Oversikt/
 *   ├── LocationHeader (tittel, tilbake-knapp, visningstype)
 *   ├── LocationTable (registreringstabell med bilder og artsinfo)
 *   └── LocationActions (rediger, slett, eksporter)
 * - Overlays/
 *   ├── ImageViewer (bildevisning)
 *   └── SpeciesPopup (artsinfo)
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Eye, Calendar } from 'lucide-react';
import { useAppState } from '../../hooks/useAppState';
import { useDevice } from '../../hooks/useDevice';

// Komponentimporter
import LocationHeader from './LocationHeader';
import LocationTable from './LocationTable';
import LocationActions from './LocationActions';
import ImageViewer from '../overlays/ImageViewer/index';
import SpeciesPopup from '../overlays/SpeciesPopup';
import MobileRegistrationList from './MobileRegistrationList';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('no', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).replace(/\//g, '.');
};

const LocationDetail = ({ 
  location, 
  onBack,
  selectedRegistrations,           // Dette er den lokale tilstanden (plural)
  setSelectedRegistrations,        // Dette er for checkbox-håndtering (plural)
  handleDelete,
  handleEdit,
  handleDeleteImage,
  setMapCenter,
  setActiveButton,
  mapInstance
}) => {
  const { isPhone } = useDevice();
  const [showMap, setShowMap] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [selectedImageSet, setSelectedImageSet] = useState(null);
  const { selectedRegistration, setSelectedRegistration } = useAppState();  // Dette er den globale tilstanden (singular)

  const handleSpeciesClick = useCallback((species, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.left + (rect.width / 2),
      y: rect.top + window.scrollY
    });
    setSelectedSpecies(species);
  }, []);

  const handleMapPin = useCallback((reg, e) => {
    console.log('📍 Map pin clicked:', reg);
    e?.stopPropagation();
    
    const lat = parseFloat(reg.breddegrad);
    const lng = parseFloat(reg.lengdegrad);
    
    // Reset alle relevante states
    setActiveButton(null);
    setSelectedRegistration(null);  // Nå har vi tilgang til denne
    setMapCenter({ lat, lng });
    
    // Lukk oversikten
    onBack();
    
    // Oppdater kartvisning og vis popup
    if (mapInstance) {
      mapInstance.setView([lat, lng], 17);
      setTimeout(() => {
        handleSpeciesClick(reg.species, {
          currentTarget: {
            getBoundingClientRect: () => ({
              left: window.innerWidth / 2,
              top: window.innerHeight / 2
            })
          }
        });
      }, 100);
    }
  }, [setMapCenter, mapInstance, handleSpeciesClick, onBack, setActiveButton, setSelectedRegistration]);

  useEffect(() => {
    if (selectedRegistration) {
      console.log('🎯 Selected registration in Oversikt:', selectedRegistration);
      const registrationKey = Object.keys(location.registreringer).find(
        key => location.registreringer[key].id === selectedRegistration.id
      );
  
      if (registrationKey) {
        console.log('📍 Found matching registration key:', registrationKey);
        setSelectedRegistrations(prev => ({
          ...prev,
          [location.navn]: {
            [registrationKey]: true
          }
        }));
  
        // Vent litt før scrolling
        setTimeout(() => {
          const element = document.querySelector(`[data-registration-id="${selectedRegistration.id}"]`);
          if (element) {
            console.log('🔍 Scrolling to element:', element);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-blue-50');
          }
        }, 100);
      }
    }
  }, [selectedRegistration, location.navn, location.registreringer, setSelectedRegistrations]);

  const containerStyles = isPhone
    ? "fixed inset-0 bg-white z-50" 
    : "max-w-screen-xl mx-auto";

  const contentStyles = isPhone
    ? "h-full flex flex-col"
    : "";

  const tableContainerStyles = isPhone
    ? "flex-1 overflow-auto px-4"
    : "overflow-x-auto";

  const actionStyles = isPhone
    ? "mt-auto px-4 py-3 border-t bg-white"
    : "mt-6 px-6";

  return (
    <div className={containerStyles}>
      <div className={contentStyles}>
        <div className={isPhone ? "px-4 py-3 border-b" : "p-6"}>
          <LocationHeader 
            name={location.navn}
            registrationCount={Object.keys(location.registreringer).length}
            showMap={showMap}
            onBack={onBack}
            onToggleView={() => setShowMap(!showMap)}
          />
        </div>

        <div className={tableContainerStyles}>
  {isPhone ? (
    <MobileRegistrationList
      registrations={location.registreringer}
      selectedRegistrations={selectedRegistrations[location.navn] || {}}
      onSelectionChange={newSelection => setSelectedRegistrations(prev => ({
        ...prev,
        [location.navn]: newSelection
      }))}
      onSpeciesClick={handleSpeciesClick}
      onImageClick={(images, regId) => setSelectedImageSet({ 
        images, 
        registrationId: regId 
      })}
      onMapPin={handleMapPin}
    />
  ) : (
    <LocationTable 
      location={location}
      selectedRegistrations={selectedRegistrations}
      onSelectionChange={newSelection => setSelectedRegistrations(prev => ({
        ...prev,
        [location.navn]: newSelection
      }))}
      onSpeciesClick={handleSpeciesClick}
      onImageClick={(images, regId) => setSelectedImageSet({ 
        images, 
        registrationId: regId 
      })}
      onMapPin={handleMapPin}
    />
  )}
</div>

        <div className={actionStyles}>
          <LocationActions 
            selectedRegistrations={selectedRegistrations[location.navn] || {}}
            onEdit={() => {
              const toEdit = Object.entries(selectedRegistrations[location.navn] || {})
                .filter(([_, isSelected]) => isSelected)
                .map(([regKey]) => location.registreringer[regKey]);
              
              if (toEdit.length === 1) {
                handleEdit(toEdit[0]);
              }
            }}
            onDelete={handleDelete}
            location={location}
          />
        </div>
      </div>

      {selectedSpecies && popupPosition && (
        <SpeciesPopup 
          species={selectedSpecies}
          position={popupPosition}
          onClose={() => {
            setSelectedSpecies(null);
            setPopupPosition(null);
          }}
        />
      )}

      {selectedImageSet && (
        <ImageViewer 
          imageData={selectedImageSet.images}
          onClose={() => setSelectedImageSet(null)}
          registrationId={selectedImageSet.registrationId}
          onDeleteImage={(registrationId, updatedImages) => {
            handleDeleteImage(registrationId, updatedImages);
            if (updatedImages.length === 0) {
              setSelectedImageSet(null);
            } else {
              setSelectedImageSet({ 
                images: updatedImages, 
                registrationId: registrationId 
              });
            }
          }}
        />
      )}
    </div>
  );
};

const Oversikt = ({ onClose, mapInstance }) => {
  const { isPhone } = useDevice();
  const { 
    registrations, 
    handleDeleteRegistrations, 
    handleEditRegistration,
    handleDeleteImage, 
    selectedRegistration,
    setSelectedRegistration,
    setMapCenter,
    setActiveButton
  } = useAppState();

  const [sortBy, setSortBy] = useState('observasjoner');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRegistrations, setSelectedRegistrations] = useState({});

  const locations = useMemo(() => {
    return registrations.reduce((acc, reg) => {
      if (!acc[reg.navnPaLokalitet]) {
        acc[reg.navnPaLokalitet] = {
          navn: reg.navnPaLokalitet,
          observasjoner: 0,
          opprettet: reg.date,
          registreringer: {}
        };
      }
      const key = `${reg.id}`;
      if (!acc[reg.navnPaLokalitet].registreringer[key]) {
        acc[reg.navnPaLokalitet].registreringer[key] = reg;
        acc[reg.navnPaLokalitet].observasjoner++;
      }
      if (new Date(reg.date) < new Date(acc[reg.navnPaLokalitet].opprettet)) {
        acc[reg.navnPaLokalitet].opprettet = reg.date;
      }
      return acc;
    }, {});
  }, [registrations]);

  const sortedLocations = useMemo(() => {
    return Object.values(locations).sort((a, b) => {
      if (sortBy === 'observasjoner') {
        return sortOrder === 'desc' ? 
          b.observasjoner - a.observasjoner : 
          a.observasjoner - b.observasjoner;
      } else {
        return sortOrder === 'desc' ? 
          new Date(b.opprettet) - new Date(a.opprettet) :
          new Date(a.opprettet) - new Date(b.opprettet);
      }
    });
  }, [locations, sortBy, sortOrder]);

  const handleDelete = useCallback(() => {
    if (!selectedLocation || !locations[selectedLocation]) return;

    const locationData = locations[selectedLocation];
    const selectedRegs = selectedRegistrations[selectedLocation];
    
    if (!selectedRegs || !locationData.registreringer) return;

    const registrationsToDelete = Object.entries(selectedRegs)
      .filter(([_, isSelected]) => isSelected)
      .map(([regKey]) => locationData.registreringer[regKey])
      .filter(Boolean);

    if (registrationsToDelete.length === 0) return;

    handleDeleteRegistrations(registrationsToDelete);
    
    setSelectedRegistrations(prev => ({
      ...prev,
      [selectedLocation]: {}
    }));

    const remainingCount = Object.values(locationData.registreringer).length - registrationsToDelete.length;
    if (remainingCount === 0) {
      setSelectedLocation(null);
      setSelectedRegistration(null);
    }
  }, [selectedLocation, selectedRegistrations, locations, handleDeleteRegistrations, setSelectedRegistration]);

  useEffect(() => {
    if (selectedRegistration && locations[selectedRegistration.navnPaLokalitet]) {
      setSelectedLocation(selectedRegistration.navnPaLokalitet);
    }
  }, [selectedRegistration, locations]);

  if (selectedLocation && locations[selectedLocation]) {
    return (
      <LocationDetail
        location={locations[selectedLocation]}
        onBack={() => {
          setSelectedLocation(null);
          setSelectedRegistration(null);
        }}
        selectedRegistrations={selectedRegistrations}
        setSelectedRegistrations={setSelectedRegistrations}
        handleDelete={handleDelete}
        handleEdit={handleEditRegistration}
        handleDeleteImage={handleDeleteImage}
        setMapCenter={setMapCenter}
        setActiveButton={setActiveButton}
        mapInstance={mapInstance}
      />
    );
  }

  const containerStyles = isPhone
    ? "fixed inset-0 bg-white z-50"
    : "max-w-4xl mx-auto p-4";

  const contentStyles = isPhone
    ? "h-full flex flex-col"
    : "bg-white rounded-lg shadow p-6";

  return (
    <div className={containerStyles}>
      <div className={contentStyles}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Oversikt over registreringer</h2>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Lokalitet</th>
                <th className="p-3 text-center cursor-pointer w-32">
                  <div 
                    className="flex items-center justify-center gap-1"
                    onClick={() => {
                      if (sortBy === 'observasjoner') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('observasjoner');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <Eye size={16} />
                    {sortBy === 'observasjoner' && (
                      <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </div>
                </th>
                <th className="p-3 text-center cursor-pointer w-32">
                  <div 
                    className="flex items-center justify-center gap-1"
                    onClick={() => {
                      if (sortBy === 'opprettet') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('opprettet');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <Calendar size={16} />
                    {sortBy === 'opprettet' && (
                      <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLocations.map((location) => (
                <tr 
                  key={location.navn}
                  onClick={() => setSelectedLocation(location.navn)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-3">{location.navn}</td>
                  <td className="p-3 text-center">{location.observasjoner}</td>
                  <td className="p-3 text-center">{formatDate(location.opprettet)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={isPhone ? "mt-auto px-4 py-3 border-t" : "mt-6"}>
          <button 
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
};

export default Oversikt;