/**
 * @file StepperForm.js
 * @description En stegvis registreringsform med moderne design og UX fokus
 * 
 * Hovedfunksjoner:
 * 1. Viser registreringsskjema i separate steg (Art, Tid, Posisjon, Lokalitet)
 * 2. Indikerer progresjon med fargekoding og ikoner
 * 3. Håndterer brukernavigasjon mellom steg
 * 4. Støtter låsing av felt for gjentatte registreringer
 * 
 * Steg:
 * - Art & bilder: Registrering av art og opplasting av bilder
 * - Tid: Dato og tidspunkt for observasjon
 * - Posisjon: GPS eller manuell posisjonsregistrering
 * - Lokalitet: Stedsangivelse og evt. kommentarer
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Clock, MapPin, Map } from 'lucide-react';
import { useLockedFields } from '../../hooks/useLockedFields';
import SpeciesInput from './SpeciesInput';
import ImageUpload from './ImageUpload';
import DateTimeInput from './DateTimeInput';
import CoordinateInput from './CoordinateInput';
import LocationInput from './LocationInput';
import AccuracyInput from './AccuracyInput';
import RegistrationSubmit from './RegistrationSubmit';
import GPSButton from './gps/GPSButton';
import { useDevice } from '../../hooks/useDevice';

const FORM_HEIGHT = 'h-96';

const StepperForm = ({
  onClose,
  onSelectInMap,
  selectedCoordinates,
  onSave,
  formData,
  setFormData,
  selectedImages,
  setSelectedImages,
  onReset
}) => {
  const { lockedFields, toggleLock } = useLockedFields();
  const [currentStep, setCurrentStep] = useState(0);
  const { isPhone } = useDevice();

  // Reset til første steg når skjemaet åpnes på nytt
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
  
    setCurrentStep(0); // Kjører kun ved mounting
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Tom dependency array = kjører kun ved mounting

  useEffect(() => {
    if (lockedFields.noyaktighet) {
      const savedValue = localStorage.getItem('lockedNoyaktighet');
      if (savedValue) {
        setFormData(prev => ({
          ...prev,
          noyaktighet: savedValue
        }));
      }
    }
  
    if (lockedFields.navnPaLokalitet) {
      const savedValue = localStorage.getItem('lockedNavnPaLokalitet');
      if (savedValue) {
        setFormData(prev => ({
          ...prev,
          navnPaLokalitet: savedValue
        }));
      }
    }
  }, [lockedFields, setFormData]);

  useEffect(() => {
    if (selectedCoordinates) {
      const positionStepIndex = steps.findIndex(step => step.id === 'posisjon');
      setCurrentStep(positionStepIndex);
    }
  }, [selectedCoordinates]);
  
  const steps = useMemo(() => [
    {
      id: 'art',
      label: 'Hva',
      icon: Search,
      isComplete: () => Boolean(formData.speciesInput && formData.artsNavn),
      content: (
        <div className="space-y-4 animate-fade-in">
          <SpeciesInput formData={formData} setFormData={setFormData} />
          <ImageUpload
            selectedImages={selectedImages}
            onImagesChange={setSelectedImages}
            selectedCoordinates={selectedCoordinates}
          />
        </div>
      )
    },
    {
      id: 'tid',
      label: 'Når',
      icon: Clock,
      isComplete: () => Boolean(formData.date && formData.time),
      content: (
        <div className="animate-fade-in">
          <DateTimeInput 
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      )
    },
    {
      id: 'posisjon',
      label: 'Hvor',
      icon: MapPin,
      isComplete: () => Boolean(
        formData.breddegrad && 
        formData.lengdegrad && 
        formData.noyaktighet
      ),
      content: (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2">
            <GPSButton onPositionSelected={position => {
              if (position) {
                setFormData(prev => ({
                  ...prev,
                  breddegrad: position.lat.toFixed(6),
                  lengdegrad: position.lng.toFixed(6)
                }));
              }
            }} />
            <button 
              onClick={onSelectInMap}
              className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center gap-2"
            >
              <Map className="w-4 h-4" />
              Velg i kart
            </button>
          </div>
          <CoordinateInput formData={formData} setFormData={setFormData} />
          <AccuracyInput 
            formData={formData} 
            setFormData={setFormData}
            lockedFields={lockedFields}
            toggleLock={(field) => toggleLock(field, formData)}
          />
        </div>
      )
    },
    {
      id: 'lokalitet',
      label: 'Lokalitet',
      icon: Map,
      isComplete: () => Boolean(formData.navnPaLokalitet),
      content: (
        <div className="space-y-4 animate-fade-in">
          <LocationInput 
            formData={formData} 
            setFormData={setFormData}
            lockedFields={lockedFields}
            toggleLock={(field) => toggleLock(field, formData)}
          />
          <div className="space-y-2">
            <label className="block text-gray-700">Kommentar</label>
            <textarea
              value={formData.comment || ''}
              onChange={e => setFormData(prev => ({...prev, comment: e.target.value}))}
              className="w-full p-2 border rounded resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Skriv inn eventuelle kommentarer..."
            />
          </div>
          <RegistrationSubmit
            formData={formData}
            selectedImages={selectedImages}
            onSave={onSave}
            onClose={onClose}
            onReset={onReset}
          />
        </div>
      )
    }
  ], [formData, setFormData, selectedImages, setSelectedImages, onSelectInMap, onSave, onClose, selectedCoordinates, lockedFields, toggleLock]);

  return (
    <>
      <div className="fixed inset-0 bg-black/0" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 flex justify-center">
        <div 
          className={`
            bg-white shadow-lg rounded-t-xl
            ${isPhone ? 'w-full' : 'w-full max-w-[600px]'}
          `}
          onClick={e => e.stopPropagation()}
        >
        <div className={`${FORM_HEIGHT} overflow-hidden`}>
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Registrer</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ×
              </button>
            </div>
            
            {steps[currentStep].content}
          </div>
        </div>
        

        <div className="flex border-t border-gray-200 p-2 bg-white">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`
                  flex-1 p-2 rounded-lg transition-all duration-200
                  flex flex-col items-center gap-1
                  ${index === currentStep 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : step.isComplete()
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </>
  );
};

export default StepperForm;