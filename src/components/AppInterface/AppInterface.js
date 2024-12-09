/**
 * @file AppInterface.js
 * @description Hovedkomponent for brukergrensesnittet i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Fungerer som container for alle hovedkomponenter i appen.
 * 2. Håndterer autentisering og visning av riktig grensesnitt basert på innloggingsstatus.
 * 3. Koordinerer interaksjoner mellom kart, overlays og UI-komponenter.
 * 4. Bruker useAppState-hooken for å få tilgang til global app-tilstand og funksjoner.
 * 
 * Komponentstruktur:
 * - MapComponent: Viser kartet og håndterer kartrelaterte funksjoner.
 * - CrosshairOverlay: Vises når brukeren velger lokasjon på kartet.
 * - TopUI: Inneholder toppmenyen og knapper for hovedfunksjoner.
 * - BottomUI: Inneholder bunnmenyen med ytterligere funksjoner.
 * - SidePanel: Viser brukerinformasjon og app-innstillinger.
 * - RegisterOverlay: Skjema for å registrere nye observasjoner.
 * - OversiktOverlay: Viser oversikt over registrerte observasjoner.
 * 
 * Viktig for videre utvikling:
 * - Håndtering av autentisering og brukersesjoner.
 * - Koordinering av tilstandsendringer mellom ulike komponenter.
 * - Håndtering av ulike visningsmoduser (registrering, oversikt).
 * - Integrasjon med kartfunksjonalitet og posisjonering.
 */

import React, { useState, useCallback, useEffect } from 'react'
import TopUI from '../layout/TopUI';
import BottomUI from '../layout/BottomUI';
import SidePanel from '../layout/SidePanel';
import MapComponent from '../map/MapComponent';
import CrosshairOverlay from '../map/CrosshairOverlay';
import RegisterOverlay from '../overlays/RegisterOverlay';
import OversiktOverlay from '../overlays/OversiktOverlay';
import AuthForm from '../auth/AuthForm';
import { useAppState } from '../../hooks/useAppState';

const AppInterface = () => {
  // Hent all nødvendig state og funksjoner fra useAppState
  const {
    activeButton,
    setActiveButton,
    isSidePanelOpen,
    setIsSidePanelOpen,
    mapCenter,
    setMapCenter,
    location,
    shouldZoom,
    setShouldZoom,
    isSelectingLocation,
    setSelectedLocation,
    selectedCoordinates,
    registrations,
    selectedRegistration,
    setSelectedRegistration,
    selectedLocation,
    user,
    formData,
    setFormData,
    handleLogout,
    handleLocateMe,
    handleSelectInMap,
    handleMapSelection,
    handleSaveRegistration,
    currentVersion,
    speciesCount,
    isLoggedIn,
    setIsLoggedIn,
    handleAuthSuccess,
    isTracking,
    setIsTracking,
  } = useAppState();

  useEffect(() => {
    console.log('🔄 State update:', {
      activeButton,
      selectedLocation,
      selectedRegistration
    });
  }, [activeButton, selectedLocation, selectedRegistration]);

  const handleRegistrationSelect = useCallback((registration) => {
    console.log('🎯 Registration selected:', registration);
    
    // Sett aktiv knapp til 'Oversikt' først
    setActiveButton('Oversikt');
    
    // Vent litt før vi setter selected location for å sikre at oversikten er åpen
    setTimeout(() => {
      setSelectedLocation(registration.navnPaLokalitet);
      setSelectedRegistration(registration);
      console.log('🔄 Setting location and registration:', {
        location: registration.navnPaLokalitet,
        registration: registration
      });
    }, 100);
  }, [setSelectedRegistration, setSelectedLocation, setActiveButton]);
  
  // Legg til en effekt for å håndtere registreringsoppdateringer
  useEffect(() => {
    const handleRegistrationsUpdate = (event) => {
      console.log('🔄 AppInterface received registrationsUpdated event:', event.detail);
      
      if (event.detail.type === 'deletion') {
        // Hvis den valgte registreringen ble slettet, nullstill valget
        if (selectedRegistration && event.detail.deletedIds.includes(selectedRegistration.id)) {
          setSelectedRegistration(null);
          setSelectedLocation(null);
        }
      }
    };
  
    window.addEventListener('registrationsUpdated', handleRegistrationsUpdate);
    return () => window.removeEventListener('registrationsUpdated', handleRegistrationsUpdate);
  }, [selectedRegistration, setSelectedRegistration, setSelectedLocation]);

  const [mapInstance, setMapInstance] = useState(null);

  const handleButtonClick = useCallback((buttonName, openCamera = false) => {
    console.log('🔘 Button clicked:', buttonName, 'Current:', activeButton, 'Camera:', openCamera);
    
    if (activeButton === 'Oversikt' && buttonName !== 'Oversikt') {
      setSelectedRegistration(null);
      setSelectedLocation(null);
    }
    
    setActiveButton(buttonName === activeButton ? null : buttonName);
    
    if (openCamera && buttonName === 'Registrer') {
      sessionStorage.setItem('openCameraOnMount', 'true');
    }
  }, [activeButton, setActiveButton, setSelectedRegistration, setSelectedLocation]);

  // Vis påloggingsskjema hvis brukeren ikke er logget inn
  if (!isLoggedIn) {
    return <AuthForm onAuthSuccess={(user) => {
      handleAuthSuccess(user);
      setIsLoggedIn(true);
    }} />;
  }

  // Hovedgrensesnitt for innloggede brukere
  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Kartkomponent som viser hovedkartet */}
      <MapComponent 
        mapCenter={mapCenter}
        setMapCenter={setMapCenter}
        location={location}
        shouldZoom={shouldZoom}
        setShouldZoom={setShouldZoom}
        isSelectingLocation={isSelectingLocation}
        handleMapSelection={handleMapSelection}
        registrations={registrations}
        isTracking={isTracking}
        setIsTracking={setIsTracking}
        onRegistrationSelect={handleRegistrationSelect}
        onMapReady={setMapInstance}
      />

      {/* Overlay for å lukke sidepanelet ved klikk utenfor */}
      {isSidePanelOpen && (
        <div
          className="absolute inset-0 z-[999]"
          onClick={() => setIsSidePanelOpen(false)}
        />
      )}

      {/* Viser et trådkors når brukeren velger lokasjon på kartet */}
      {isSelectingLocation && <CrosshairOverlay />}
      
  
      {/* Container for alle UI-elementer over kartet */}
      <div className="absolute inset-0 z-[1000] pointer-events-none">
        {/* Topp-meny */}
        <TopUI 
          isSidePanelOpen={isSidePanelOpen}
          setIsSidePanelOpen={setIsSidePanelOpen}
          activeButton={activeButton}
          handleButtonClick={handleButtonClick}
        />
        
        {/* Bunn-meny */}
        <BottomUI 
          handleLocateMe={handleLocateMe}
          handleButtonClick={handleButtonClick}
          activeButton={activeButton}
          isTracking={isTracking}
        />

        {/* Registreringsoverlay - vises når 'Registrer' er aktiv */}
        {activeButton === 'Registrer' && (
          <RegisterOverlay 
            onClose={() => setActiveButton(null)}
            mapCenter={mapCenter}
            selectedCoordinates={selectedCoordinates}
            onSelectInMap={handleSelectInMap}
            onSave={handleSaveRegistration}
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {/* Oversiktsoverlay - viser alle registreringer */}
        {activeButton === 'Oversikt' && (
          <OversiktOverlay 
          registrations={registrations}
          onClose={() => setActiveButton(null)}
          onSelectLocation={(location) => {
            setSelectedLocation(location);
          }}
          setMapCenter={setMapCenter}  
          setActiveButton={setActiveButton}
          mapInstance={mapInstance}
        />
        )}

        {/* Sidepanel - viser brukerinformasjon og app-innstillinger */}
        <SidePanel 
          isSidePanelOpen={isSidePanelOpen}
          setIsSidePanelOpen={setIsSidePanelOpen}
          user={user}
          handleLogout={() => {
            handleLogout();
            setIsLoggedIn(false);
          }}
          currentVersion={currentVersion}
          speciesCount={speciesCount}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default AppInterface;