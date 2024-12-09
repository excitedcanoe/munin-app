/**
 * @file useAppState.js
 * @description Custom hook for global tilstandshåndtering i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Håndterer all global tilstand for appen
 * 2. Koordinerer datasynkronisering og offline-funksjonalitet
 * 3. Håndterer interaksjoner med kart og registreringsskjema
 * 4. Administrerer søk og oppdatering av artsdata
 * 
 * Funksjonelle områder:
 * - Brukerautentisering (via useAuth)
 * - Registreringshåndtering med bildestøtte
 * - Offline-first datalagring
 * - Geolokasjon og karthåndtering
 * - Synkronisering mellom økter
 * 
 * State-struktur:
 * - Brukerdata: Autentisering og preferanser
 * - Registreringer: Brukerens artsregistreringer
 * - UI-tilstand: Aktive visninger og interaksjoner
 * - Kartdata: Lokasjon og kartinnstillinger
 * 
 * @requires useAuth - Håndterer autentisering og brukersesjoner
 * @requires speciesDatabase - API for artsdatabase-interaksjoner
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  checkAndUpdateData, 
  searchSpecies, 
  getCurrentDataVersion, 
  getSpeciesCount 
} from '../utils/speciesDatabase';
import useAuth from './useAuth';

const getStoredRegistrations = () => {
  try {
    const stored = localStorage.getItem('registrations');
    console.log('🔍 Checking stored registrations');
    
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        console.log('✅ Found valid registrations array:', parsed.length, 'items');
        return parsed;
      }
    }
    console.log('⚠️ No valid registrations found, returning empty array');
    return [];
  } catch (error) {
    console.error('❌ Error parsing stored registrations:', error);
    return [];
  }
};

export const useAppState = () => {
  // Hent auth context
  const { user, isLoggedIn } = useAuth();

  // ---------- UI Tilstand ----------
  const [activeButton, setActiveButton] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // ---------- Kart og Lokasjon ----------
  const [mapCenter, setMapCenter] = useState({ lat: 65, lng: 13 });
  const [shouldZoom, setShouldZoom] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // ---------- Registreringer og Data ----------
  const [registrations, setRegistrations] = useState(getStoredRegistrations);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [currentVersion, setCurrentVersion] = useState('');
  const [speciesCount, setSpeciesCount] = useState(0);

  // ---------- Søk ----------
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // ---------- Skjemadata ----------
  const [formData, setFormData] = useState({
    speciesInput: '',
    artsNavn: '',
    date: '',
    time: '',
    lokalitet: '',
    breddegrad: '',
    lengdegrad: '',
    navnPaLokalitet: '',
    noyaktighet: ''
  });

  // ---------- Effekter ----------

  // Last data når bruker er innlogget
  useEffect(() => {
    const syncRegistrations = () => {
      console.log('🔄 Syncing registrations with localStorage');
      const currentStored = getStoredRegistrations();
      
      if (JSON.stringify(currentStored) !== JSON.stringify(registrations)) {
        console.log('⚠️ State mismatch detected, updating from localStorage');
        setRegistrations(currentStored);
      }
    };
  
    if (isLoggedIn) {
      initializeDatabase();
      syncRegistrations(); // Nå er denne definert og kan kalles
    }
  }, [isLoggedIn, registrations]);

  useEffect(() => {
    const fetchCurrentVersion = async () => {
      try {
        const version = await getCurrentDataVersion();
        setCurrentVersion(version || 'Not set');
      } catch (error) {
        console.error('Error fetching current version:', error);
        setCurrentVersion('Error');
      }
    };
  
    const fetchSpeciesCount = async () => {
      try {
        const count = await getSpeciesCount();
        setSpeciesCount(count);
      } catch (error) {
        console.error('Error fetching species count:', error);
        setSpeciesCount(0);
      }
    };
  
    if (isLoggedIn) {
      initializeDatabase();
      fetchCurrentVersion();
      fetchSpeciesCount();
    }
  }, [isLoggedIn]);

  // Synkroniser registreringer med localStorage
  useEffect(() => {
    if (isLoggedIn) {
      console.log('Current registrations state:', registrations);
      localStorage.setItem('registrations', JSON.stringify(registrations));
    }
  }, [registrations, isLoggedIn]);

  // Håndter registreringssynkronisering
  useEffect(() => {
    if (!isLoggedIn) return;

    const syncRegistrations = () => {
      console.log('🔄 Syncing registrations with localStorage');
      const currentStored = getStoredRegistrations();
      
      if (JSON.stringify(currentStored) !== JSON.stringify(registrations)) {
        console.log('⚠️ State mismatch detected, updating from localStorage');
        setRegistrations(currentStored);
      }
    };

    syncRegistrations();
    
    const handleStorageChange = (event) => {
      if (event.key === 'registrations') {
        console.log('🔄 Storage change detected, syncing registrations');
        const storedRegistrations = getStoredRegistrations();
        setRegistrations(storedRegistrations);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('registrationsUpdated', syncRegistrations);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('registrationsUpdated', syncRegistrations);
    };
  }, [registrations, isLoggedIn]);

  // Synkroniser offline data
  useEffect(() => {
    if (!isLoggedIn) return;

    const syncOfflineData = async () => {
      if (navigator.onLine && offlineQueue.length > 0) {
        for (const registration of offlineQueue) {
          try {
            const updatedRegistrations = registrations.map(reg =>
              reg.id === registration.id ? { ...reg, synced: true } : reg
            );
            setRegistrations(updatedRegistrations);
            localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
          } catch (error) {
            console.error('Failed to sync registration:', error);
          }
        }
        setOfflineQueue([]);
        localStorage.removeItem('offlineQueue');
      }
    };

    window.addEventListener('online', syncOfflineData);
    return () => window.removeEventListener('online', syncOfflineData);
  }, [offlineQueue, registrations, isLoggedIn]);

  // ---------- Callback Funksjoner ----------

  const initializeDatabase = async () => {
    try {
      setIsInitialLoadComplete(false);
      await checkAndUpdateData((progress) => {
        setLoadProgress(progress);
      });
      setIsInitialLoadComplete(true);
    } catch (error) {
      console.error('Error initializing database:', error);
      setIsInitialLoadComplete(true);
    }
  };

  // Registreringshåndtering
  const handleSaveRegistration = useCallback(async (registrationData) => {
    if (!isLoggedIn) return;

    console.log('💾 Starting save process for new registration');
    
    try {
      let images = [];
      if (registrationData.images?.length > 0) {
        console.log('📸 Processing images:', registrationData.images.length);
        images = registrationData.images;
      }
      
      setRegistrations(prevRegistrations => {
        const newRegistration = {
          ...registrationData,
          id: Date.now(),
          latinName: registrationData.artsNavn,
          synced: navigator.onLine,
          userId: user?.id,
          images
        };
        
        console.log('📸 New registration with images:', newRegistration);
        const updatedRegistrations = [...prevRegistrations, newRegistration];
        
        try {
          localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
          console.log('💾 Successfully saved to localStorage with images');
        } catch (error) {
          console.error('❌ Error saving registration:', error);
          if (error.name === 'QuotaExceededError') {
            alert('Ikke nok lagringsplass. Prøv å slette noen gamle registreringer.');
          }
        }
        
        return updatedRegistrations;
      });
    } catch (error) {
      console.error('❌ Error processing registration:', error);
      alert('Det oppstod en feil under registrering. Prøv igjen.');
    }
  }, [isLoggedIn, user]);

  // Bildehåndtering
  const handleDeleteImage = useCallback((registrationId, updatedImages) => {
    if (!isLoggedIn) return;

    console.log('🗑️ Starting image deletion for registration:', registrationId);
    
    setRegistrations(prevRegistrations => {
      const updatedRegistrations = prevRegistrations.map(reg => {
        if (reg.id === registrationId) {
          return { ...reg, images: updatedImages };
        }
        return reg;
      });
      
      try {
        localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
        window.dispatchEvent(new CustomEvent('registrationsUpdated'));
      } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
      }
      
      return updatedRegistrations;
    });
  }, [isLoggedIn]);

  // Sletting av registreringer
  const handleDeleteRegistrations = useCallback((registrationsToDelete) => {
    if (!isLoggedIn) return;

    console.log('🗑️ Starting deletion process');
    
    setRegistrations(prevRegistrations => {
      const idsToDelete = new Set(registrationsToDelete.map(reg => reg.id));
      const updatedRegistrations = prevRegistrations.filter(reg => !idsToDelete.has(reg.id));
      
      try {
        localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
        window.dispatchEvent(new CustomEvent('registrationsUpdated', {
          detail: { 
            updatedRegistrations,
            deletedIds: Array.from(idsToDelete),
            type: 'deletion',
            timestamp: Date.now()
          }
        }));
      } catch (error) {
        console.error('❌ Error during deletion process:', error);
      }
      
      return updatedRegistrations;
    });
  }, [isLoggedIn]);

  // Redigering av registreringer
  const handleEditRegistration = useCallback((editedRegistration) => {
    if (!isLoggedIn) return;

    setRegistrations(prevRegistrations => {
      const updatedRegistrations = prevRegistrations.map(reg =>
        reg.id === editedRegistration.id ? editedRegistration : reg
      );
      
      try {
        localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
      } catch (error) {
        console.error('Error saving edited registration:', error);
      }
      
      return updatedRegistrations;
    });
  }, [isLoggedIn]);

  // Lokasjonshåndtering
  const handleLocateMe = useCallback(() => {
    setIsTracking(prev => !prev);
    setShouldZoom(true);
  }, []);

  // UI Interaksjoner
  const handleButtonClick = useCallback((buttonName) => {
    if (activeButton === 'Oversikt' && buttonName !== 'Oversikt') {
      setSelectedRegistration(null);
      setSelectedLocation(null);
    }
    
    setActiveButton(buttonName === activeButton ? null : buttonName);
  }, [activeButton]);

  const handleSelectInMap = useCallback(() => {
    setIsSelectingLocation(true);
    setActiveButton(null);
    setIsTracking(false);
  }, []);

  const handleMapSelection = useCallback((coords) => {
    if (isSelectingLocation) {
      setSelectedCoordinates(coords);
      setIsSelectingLocation(false);
      setActiveButton('Registrer');
      setFormData(prevData => ({
        ...prevData,
        breddegrad: coords.lat.toFixed(6),
        lengdegrad: coords.lng.toFixed(6)
      }));
    }
  }, [isSelectingLocation]);

  // Søkehåndtering
  const handleSearch = useCallback(async (query) => {
    setIsLoading(true);
    try {
      const results = await searchSpecies(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching species:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // UI Tilstand
    activeButton,
    setActiveButton,
    isSidePanelOpen,
    setIsSidePanelOpen,
    isLoading,
    loadProgress,
    setLoadProgress,
    isInitialLoadComplete,
    setIsInitialLoadComplete,

    // Kart og Lokasjon
    mapCenter,
    setMapCenter,
    shouldZoom,
    setShouldZoom,
    isSelectingLocation,
    selectedLocation,
    setSelectedLocation,
    selectedCoordinates,
    isTracking,
    setIsTracking,

    // Registreringer og Data
    registrations,
    selectedRegistration,
    setSelectedRegistration,
    currentVersion,
    speciesCount,

    // Søk
    searchQuery,
    setSearchQuery,
    searchResults,
    handleSearch,

    // Skjemadata
    formData,
    setFormData,

    // Handlingshåndterere
    handleLocateMe,
    handleButtonClick,
    handleSelectInMap,
    handleMapSelection,
    handleSaveRegistration,
    handleDeleteRegistrations,
    handleEditRegistration,
    handleDeleteImage,

    // Auth state (readonly)
    user,
    isLoggedIn
  };
};

export default useAppState;