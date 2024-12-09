/**
 * @file useAppState.js
 * @description Custom hook for å håndtere global tilstand i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Håndterer all global tilstand for appen.
 * 2. Inneholder logikk for brukerautentisering, datasynkronisering, og offline-funksjonalitet.
 * 3. Håndterer interaksjoner med kartet og registreringsskjemaet.
 * 4. Administrerer søk og oppdatering av artsdata.
 * * - Brukerautentisering og sesjonshåndtering
 * - Registreringshåndtering med støtte for multiple bilder
 * - Offline-first datalagring med localStorage
 * - Bildekomprimering og -håndtering
 * - Synkronisering av data mellom økter
 * - Geolokasjon og karthåndtering
 * 
 * Struktur:
 * - State-variabler: Definerer all global tilstand.
 * - useEffect-hooks: Håndterer sideeffekter som datainnlasting og synkronisering.
 * - Callback-funksjoner: Definerer funksjoner for å oppdatere tilstand og utføre handlinger.
 * 
 * Når skal man legge til ny funksjonalitet her?
 * - Når funksjonaliteten påvirker global tilstand som brukes av flere komponenter.
 * - Når det er logikk som bør være tilgjengelig for hele appen.
 * - Når det handler om datasynkronisering eller offline-funksjonalitet.
 * 
 * Når skal man IKKE legge til ny funksjonalitet her?
 * - Når funksjonaliteten er spesifikk for en enkelt komponent.
 * - Når det ikke påvirker global tilstand eller app-wide logikk.
 * - Når det vil gjøre hooken for kompleks og vanskelig å vedlikeholde.
 * Planlagt funksjonalitet:
 * - Synkronisering med MongoDB Atlas
 * - Multi-enhet støtte
 * - Brukerbasert datadeling
 */



import { useState, useCallback, useEffect } from 'react';
import { 
  checkAndUpdateData, 
  searchSpecies, 
  getCurrentDataVersion, 
  getSpeciesCount 
} from '../utils/speciesDatabase';

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
  const [activeButton, setActiveButton] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 65, lng: 13 });
  const [shouldZoom, setShouldZoom] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [registrations, setRegistrations] = useState(() => {
    console.log('🔄 Initializing registrations state');
    return getStoredRegistrations();
  });
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [currentVersion, setCurrentVersion] = useState('');
  const [speciesCount, setSpeciesCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
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
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    console.log('Current registrations state:', registrations);
    console.log('Current localStorage:', localStorage.getItem('registrations'));
  }, [registrations]);

  useEffect(() => {
    const syncRegistrations = () => {
      console.log('🔄 Syncing registrations with localStorage');
      const currentStored = getStoredRegistrations();
      
      if (JSON.stringify(currentStored) !== JSON.stringify(registrations)) {
        console.log('⚠️ State mismatch detected, updating from localStorage');
        console.log('💾 LocalStorage:', currentStored.length, 'items');
        console.log('🗄️ Current state:', registrations.length, 'items');
        setRegistrations(currentStored);
      } else {
        console.log('✅ State is in sync with localStorage');
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
      window.addEventListener('registrationsUpdated', () => {
        console.log('🔄 Registration update event detected, syncing state');
        const storedRegistrations = getStoredRegistrations();
        setRegistrations(storedRegistrations);
      });
    
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('registrationsUpdated', handleStorageChange);
      };
    }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  
    const storedOfflineQueue = localStorage.getItem('offlineQueue');
    if (storedOfflineQueue) {
      setOfflineQueue(JSON.parse(storedOfflineQueue));
    }

    fetchCurrentVersion();
    fetchSpeciesCount();
  }, []);

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

  // Oppdater handleSaveRegistration i useAppState.js
  const handleSaveRegistration = useCallback(async (registrationData) => {
    console.log('💾 Starting save process for new registration');
    
    try {
      let images = [];
      if (registrationData.images && registrationData.images.length > 0) {
        console.log('📸 Processing images:', registrationData.images.length);
        images = registrationData.images; // Siden bildene allerede er komprimert i RegisterForm
      }
      
      setRegistrations(prevRegistrations => {
        const newRegistration = {
          ...registrationData,
          id: Date.now(),
          latinName: registrationData.artsNavn,
          synced: navigator.onLine,
          images  // Lagrer bildene direkte
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
  }, [setRegistrations]);

// Legg til en funksjon for å slette bilder
const handleDeleteImage = useCallback((registrationId, updatedImages) => {
  console.log('🗑️ Starting image deletion for registration:', registrationId);
  
  setRegistrations(prevRegistrations => {
    const updatedRegistrations = prevRegistrations.map(reg => {
      if (reg.id === registrationId) {
        console.log('📸 Updating images for registration:', registrationId);
        console.log('📸 Old images count:', reg.images?.length);
        console.log('📸 New images count:', updatedImages?.length);
        
        return {
          ...reg,
          images: updatedImages
        };
      }
      return reg;
    });
    
    try {
      localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
      console.log('💾 Successfully saved updated registrations to localStorage');
      
      // Dispatch en event for å sikre synkronisering
      window.dispatchEvent(new CustomEvent('registrationsUpdated', {
        detail: {
          type: 'imageUpdate',
          registrationId,
          updatedImages,
          timestamp: Date.now()
        }
      }));
      
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
    
    return updatedRegistrations;
  });
}, []);
  

const handleDeleteRegistrations = useCallback((registrationsToDelete) => {
  console.log('🗑️ Starting deletion process');
  console.log('📤 Items to delete:', registrationsToDelete.length);
  
  setRegistrations(prevRegistrations => {
    const idsToDelete = new Set(registrationsToDelete.map(reg => reg.id));
    console.log('🔍 IDs to delete:', Array.from(idsToDelete));
    
    const updatedRegistrations = prevRegistrations.filter(reg => !idsToDelete.has(reg.id));
    
    try {
      // Viktig: Lagre til localStorage FØR vi returnerer de oppdaterte registreringene
      localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
      console.log('💾 Successfully updated localStorage');
      
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
      // Kunne lagt til en alert her for å informere brukeren
    }
    
    return updatedRegistrations;
  });
}, []);

  const handleEditRegistration = useCallback((editedRegistration) => {
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
  }, []);

  const handleAuthSuccess = useCallback((user) => {
    setUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
  }, []);

  const handleLocateMe = useCallback(() => {
    console.log('🎯 handleLocateMe: Toggling tracking');
    setIsTracking(prev => {
      console.log('🎯 handleLocateMe: Previous tracking state:', prev);
      const newState = !prev;
      console.log('🎯 handleLocateMe: New tracking state:', newState);
      return newState;
    });
    setShouldZoom(true);
  }, []);

// Legg til denne i useAppState.js etter andre useEffect hooks
useEffect(() => {
  console.log('🔄 State change detected:', {
    activeButton,
    selectedLocation,
    selectedRegistration
  });

  // Hvis vi har en selectedRegistration men ingen selectedLocation,
  // sett location automatisk
  if (selectedRegistration && !selectedLocation) {
    setSelectedLocation(selectedRegistration.navnPaLokalitet);
  }
}, [activeButton, selectedLocation, selectedRegistration]);

// Modifiser handleButtonClick
const handleButtonClick = useCallback((buttonName) => {
  console.log('🔘 Button clicked:', buttonName, 'Current:', activeButton);
  
  // Hvis vi bytter fra Oversikt til noe annet, reset selections
  if (activeButton === 'Oversikt' && buttonName !== 'Oversikt') {
    setSelectedRegistration(null);
    setSelectedLocation(null);
  }
  
  setActiveButton(buttonName === activeButton ? null : buttonName);
}, [activeButton, setSelectedRegistration, setSelectedLocation]);

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

  useEffect(() => {
    async function initializeDatabase() {
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
    }
    initializeDatabase();
  }, []);

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

  useEffect(() => {
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
  }, [offlineQueue, registrations, setRegistrations]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    handleSearch,
    isLoading,
    isInitialLoadComplete,
    setIsInitialLoadComplete,
    loadProgress,
    setLoadProgress,
    activeButton,
    setActiveButton,
    isSidePanelOpen,
    setIsSidePanelOpen,
    mapCenter,
    setMapCenter,
    shouldZoom,
    setShouldZoom,
    isSelectingLocation,
    selectedLocation,
    setSelectedLocation,
    selectedCoordinates,
    registrations,
    selectedRegistration,
    setSelectedRegistration,
    user,
    formData,
    setFormData,
    handleAuthSuccess,
    handleLogout,
    handleLocateMe,
    isTracking,
    setIsTracking,
    handleButtonClick,
    handleSelectInMap,
    handleMapSelection,
    handleSaveRegistration,
    handleDeleteRegistrations,
    handleEditRegistration,
    currentVersion,
    speciesCount,
    handleDeleteImage,
    isLoggedIn,
    setIsLoggedIn,
  };
};

export default useAppState;