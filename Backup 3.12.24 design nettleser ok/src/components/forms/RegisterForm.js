
/**
 * @file RegisterForm.js
 * @description Hovedkomponent for registreringsskjemaet.
 * 
 * Hovedfunksjoner:
 * 1. Samler og koordinerer alle inputs for en artsregistrering
 * 2. Håndterer mellomlagring av skjemadata ved kartnavigasjon
 * 3. Integrerer GPS-funksjonalitet og koordinatvalg
 * 4. Støtter låsing av felt for gjentatte registreringer
 * 
 * Komponentstruktur:
 * - SpeciesInput: Søk og valg av art
 * - ImageUpload: Bildehåndtering
 * - DateTimeInput: Dato/tid for observasjon
 * - LocationInput: Stedsangivelse
 * - AccuracyInput: Nøyaktighetsgrad
 * - GPSButton: GPS-funksjonalitet
 * - RegistrationSubmit: Lagringsknapper
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import SpeciesInput from './SpeciesInput';
import ImageUpload from './ImageUpload';
import DateTimeInput from './DateTimeInput';
import CoordinateInput from './CoordinateInput';
import LocationInput from './LocationInput';
import AccuracyInput from './AccuracyInput';
import RegistrationSubmit from './RegistrationSubmit';
import GPSButton from './gps/GPSButton';
import useLockedFields from '../../hooks/useLockedFields';

const RegisterForm = ({ 
  onClose, 
  onSelectInMap, 
  selectedCoordinates, 
  onSave,
  formData,
  setFormData 
}) => {
  const [selectedImages, setSelectedImages] = useState([]);

  const handleMapSelect = () => {
    const currentState = {
      selectedImages,
      formData
    };
    
    sessionStorage.setItem('tempFormState', JSON.stringify(currentState));
    onSelectInMap();
  };
  
  useEffect(() => {
    if (selectedCoordinates) {
      const savedState = sessionStorage.getItem('tempFormState');
      if (savedState) {
        const { selectedImages: savedImages, formData: savedFormData } = JSON.parse(savedState);
        setSelectedImages(savedImages);
        setFormData(prev => ({
          ...savedFormData,
          breddegrad: selectedCoordinates.lat.toFixed(6),
          lengdegrad: selectedCoordinates.lng.toFixed(6)
        }));
        
        sessionStorage.removeItem('tempFormState');
      }
    }
  }, [selectedCoordinates, setFormData]);

  const imageUploadRef = useRef(null);

useEffect(() => {
  const shouldOpenCamera = sessionStorage.getItem('openCameraOnMount');
  if (shouldOpenCamera === 'true') {
    // Kort timeout for å sikre at komponenten er ferdig montert
    setTimeout(() => {
      // Bruk imageUploadRef for å trigge kameraknappen
      const cameraButton = imageUploadRef.current?.querySelector('button:first-child');
      if (cameraButton) {
        cameraButton.click();
      }
    }, 100);
    
    // Fjern flagget fra sessionStorage
    sessionStorage.removeItem('openCameraOnMount');
  }
}, []);

  const handleUseCurrentPosition = (position) => {
    if (position) {
      const noyaktighetsVerdi = position.accuracy <= 5 ? "5" : 
                               position.accuracy <= 10 ? "10" : 
                               position.accuracy <= 20 ? "20" : null;

      if (noyaktighetsVerdi) {
        setFormData(prevData => ({
          ...prevData,
          breddegrad: position.lat.toFixed(6),
          lengdegrad: position.lng.toFixed(6),
          noyaktighet: noyaktighetsVerdi
        }));
      }
    }
  };

  const { lockedFields, toggleLock } = useLockedFields();

  useEffect(() => {
    if (selectedCoordinates) {
      setFormData(prevData => ({
        ...prevData,
        breddegrad: selectedCoordinates.lat.toFixed(6),
        lengdegrad: selectedCoordinates.lng.toFixed(6),
        date: lockedFields.date ? prevData.date : prevData.date,
        time: lockedFields.date ? prevData.time : prevData.time,
        navnPaLokalitet: lockedFields.navnPaLokalitet ? prevData.navnPaLokalitet : prevData.navnPaLokalitet,
        noyaktighet: lockedFields.noyaktighet ? prevData.noyaktighet : prevData.noyaktighet
      }));
    }
  }, [selectedCoordinates, setFormData, lockedFields]);

  const resetForm = () => {
    setFormData(prevData => ({
      speciesInput: '',
      artsNavn: '',
      date: lockedFields.date ? prevData.date : '',
      time: lockedFields.date ? prevData.time : '',
      breddegrad: '',
      lengdegrad: '',
      navnPaLokalitet: lockedFields.navnPaLokalitet ? prevData.navnPaLokalitet : '',
      noyaktighet: lockedFields.noyaktighet ? prevData.noyaktighet : ''
    }));
    setSelectedImages([]);
  };

  return (
    <div className="w-full"> {/* Legg til denne wrapper div'en */}
      <div className="flex justify-center items-center mb-4 relative">
        <h2 className="text-center m-0 flex-grow">Registrer</h2>
        <button 
          onClick={onClose} 
          className="absolute right-0 bg-transparent border-none cursor-pointer text-lg p-1 hover:opacity-80"
        >
          ×
        </button>
      </div>
      
      <SpeciesInput 
        formData={formData} 
        setFormData={setFormData}
      />

      <ImageUpload
        ref={imageUploadRef}
        selectedImages={selectedImages}
        onImagesChange={setSelectedImages}
        selectedCoordinates={selectedCoordinates}
      />

      <DateTimeInput 
        formData={formData}
        setFormData={setFormData}
        lockedFields={lockedFields}
        toggleLock={(field) => toggleLock(field, formData)}
      />

      <div className="mb-4">
        <label className="block mb-2">Koordinater</label>
        <div className="flex gap-2 mb-4">
          <GPSButton onPositionSelected={handleUseCurrentPosition} />
          <button 
            onClick={handleMapSelect}
            className="flex-1 p-2 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200"
          >
            <MapPin className="w-4.5 h-4.5 mr-2" />
            Velg i kart
          </button>
        </div>

        <CoordinateInput 
          formData={formData}
          setFormData={setFormData}
        />
      </div>

      <LocationInput 
        formData={formData}
        setFormData={setFormData}
        lockedFields={lockedFields}
        toggleLock={(field) => toggleLock(field, formData)}
      />

      <AccuracyInput 
        formData={formData}
        setFormData={setFormData}
        lockedFields={lockedFields}
        toggleLock={(field) => toggleLock(field, formData)}
      />

      <div className="mb-4">
        <button className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Endre til flate
        </button>
      </div>
      
      <div className="flex justify-end mb-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Mer +
        </button>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Kommentar</label>
        <textarea
          value={formData.comment || ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            comment: e.target.value
          }))}
          placeholder="Skriv inn eventuelle kommentarer..."
          className="w-full p-2 border border-gray-300 rounded min-h-[100px] resize-y"
        />
      </div>

      <RegistrationSubmit 
        formData={formData}
        selectedImages={selectedImages}
        onSave={onSave}
        onClose={onClose}
        onReset={resetForm}
      />
      </div>
  );
};

export default RegisterForm;