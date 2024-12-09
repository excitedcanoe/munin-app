/**
 * @file MapComponent.js
 * @description Hovedkartkomponent som koordinerer alle kartrelaterte underkomponenter og funksjonalitet.
 * 
 * Hovedansvar:
 * 1. Fungerer som container for kartvisning og koordinerer alle kartrelaterte komponenter
 * 2. Håndterer overordnet tilstand for kartet (senter, zoom, valgte elementer)
 * 3. Koordinerer kommunikasjon mellom kartkomponenter
 * 4. Setter opp grunnleggende kartoppsett med tile layers og basiskonfigurasjon
 * 
 * Nøkkelkomponenter som koordineres:
 * - LocationMarker: Brukerens posisjon
 * - MapEvents: Karthendelser
 * - MapSelector: Posisjonsvalg
 * - RegistrationMarker: Visning av registreringer
 * - MarkerClusterGroup: Gruppering av markører
 * 
 * Props:
 * @param {Object} mapCenter - Kartets senterpunkt {lat, lng}
 * @param {Function} setMapCenter - Oppdaterer kartets senter
 * @param {Boolean} shouldZoom - Trigger for automatisk zoom
 * @param {Function} setShouldZoom - Kontrollerer zoom-tilstand
 * @param {Boolean} isSelectingLocation - Om posisjonsvalg er aktivt
 * @param {Function} handleMapSelection - Håndterer valgt posisjon
 * @param {Array} registrations - Liste over alle registreringer
 * @param {Function} setIsTracking - Kontrollerer posisjonssporing
 * @param {Boolean} isTracking - Om posisjonssporing er aktiv
 * @param {Function} onRegistrationSelect - Håndterer valg av registrering
 * @param {Function} onMapReady - Callback når kartet er initialisert
 * 
 * Retningslinjer for fremtidige endringer:
 * 
 * Kode som BØR legges i MapComponent:
 * - Overordnet kartoppsett og konfigurasjon
 * - Koordinering mellom kartkomponenter
 * - Håndtering av global karttilstand
 * - Initialisering av kartinstansen
 * 
 * Kode som BØR legges i andre filer:
 * 1. mapUtils.js:
 *    - Hjelpefunksjoner for kartberegninger
 *    - Konstanter og konfigurasjonsdata
 *    - Verktøyfunksjoner som brukes på tvers av komponenter
 * 
 * 2. Separate komponentfiler:
 *    - Spesifikk markørlogikk (i RegistrationMarker.js)
 *    - Popup-innhold og formatering (i PopupContent.js)
 *    - Hendelseshåndtering for spesifikke features (i MapEvents.js)
 *    - Nye visuelle elementer eller kontroller
 * 
 * 3. Nye utility-filer:
 *    - Kompleks forretningslogikk
 *    - Databehandling og transformasjoner
 *    - Gjenbrukbare algoritmer
  * Styling-strategi:
 * Denne komponenten beholder inline styles fordi:
 * 1. Leaflet krever spesifikke CSS-regler for korrekt kartfunksjonalitet
 * 2. MapContainer og andre Leaflet-komponenter har strenge krav til styling
 * 3. Konvertering til Tailwind kunne ført til uforutsigbar kartoppførsel
 * 
 * Spesifikke styling-valg:
 * - MapContainer: Bruker inline styles for presis kontroll over kartdimensjoner
 * - Markører og popups: Bruker Leaflet's native styling-system
 * - Overlay-elementer: Følger Leaflet's z-index-hierarki
 * 
 * Merk: Andre UI-komponenter i appen bruker Tailwind CSS, men kart-relaterte
 * komponenter beholder sine opprinnelige styling-metoder for å sikre kompatibilitet.
 */



import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, ScaleControl, AttributionControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import MapEvents from './MapEvents';
import LocationMarker from './LocationMarker';
import MapSelector from './MapSelector';
import RegistrationMarker from './RegistrationMarker';
import { createClusterCustomIcon } from './mapUtils';
import { useGeolocation } from '../../hooks/useGeolocation';

const MapComponent = ({ 
  mapCenter, 
  setMapCenter, 
  shouldZoom, 
  setShouldZoom, 
  isSelectingLocation, 
  handleMapSelection,
  registrations,
  setIsTracking,
  isTracking,
  onRegistrationSelect,
  onMapReady
}) => {
  const [map, setMap] = useState(null);
  const [clearBufferTrigger, setClearBufferTrigger] = useState(false);
  const { location } = useGeolocation({}, isTracking);
  
  // Forbedret markersKey som inkluderer både lengde og timestamp
  const markersKey = useMemo(() => {
    return `${registrations.length}-${Date.now()}`;
  }, [registrations]);

  // Lytt på registrationsUpdated events
  useEffect(() => {
    const handleRegistrationsUpdate = (event) => {
      console.log('🗺️ Map received registrationsUpdated event:', event.detail);
      
      if (map && event.detail.type === 'deletion') {
        // Force re-render av markører
        map.invalidateSize();
        
        // Hvis det er relevant, oppdater kartvisningen
        if (event.detail.updatedRegistrations.length > 0) {
          const lastReg = event.detail.updatedRegistrations[event.detail.updatedRegistrations.length - 1];
          map.setView([lastReg.breddegrad, lastReg.lengdegrad], map.getZoom());
        }
      }
    };

    window.addEventListener('registrationsUpdated', handleRegistrationsUpdate);
    return () => window.removeEventListener('registrationsUpdated', handleRegistrationsUpdate);
  }, [map]);

  // Debug logging for registrations changes
  useEffect(() => {
    console.log('MapComponent: Registrations updated:', registrations.length);
  }, [registrations]);

  // Force marker group refresh when registrations change
  useEffect(() => {
    if (map) {
      map.invalidateSize();
      console.log('MapComponent: Forcing map refresh with key:', markersKey);
    }
  }, [map, markersKey]);

  // Handle map click events
  useEffect(() => {
    if (map) {
      const handleMapClick = () => {
        setClearBufferTrigger(prev => !prev);
      };
      map.on('click', handleMapClick);
      return () => map.off('click', handleMapClick);
    }
  }, [map]);

  const handleMapSet = (mapInstance) => {
    setMap(mapInstance);
    if (onMapReady) onMapReady(mapInstance);
  };

  // Memoized marker group with better key management
  const markerGroup = useMemo(() => {
    if (!registrations || registrations.length === 0) {
      console.log('🗺️ MapComponent: No registrations to display');
      return null;
    }

    console.log('🗺️ MapComponent: Rendering marker group with key:', markersKey);
    
    return (
      <MarkerClusterGroup
        key={markersKey}
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={40}
        disableClusteringAtZoom={13}
        spiderfyOnMaxZoom={false}
        spiderLegPolylineOptions={{ opacity: 0 }}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        removeOutsideVisibleBounds={true}
        animate={false}
        singleMarkerMode={false}
      >
        {registrations.map((reg) => (
          <RegistrationMarker
            key={`${reg.id}-${markersKey}`}
            registration={reg}
            map={map}
            onSelect={onRegistrationSelect}
            registrations={registrations}
            clearBuffer={clearBufferTrigger}
          />
        ))}
      </MarkerClusterGroup>
    );
  }, [registrations, markersKey, map, onRegistrationSelect, clearBufferTrigger]);

  return (
<MapContainer 
  center={[mapCenter.lat, mapCenter.lng]}
  zoom={5}
  maxZoom={19} 
  zoomControl={false}
  attributionControl={false}  // Skjuler default attribution
  style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
  ref={handleMapSet}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    maxZoom={19}
  />

  {/* Legg til custom attribution og scale i bunnen til venstre */}
  <AttributionControl 
    position="bottomleft"
    prefix={false}
  />
  <ScaleControl position="bottomleft" 
  metric={true}
  imperial={false}
/>
      <MapEvents 
        setMapCenter={setMapCenter} 
        onMapClick={() => setClearBufferTrigger(prev => !prev)}
        setIsTracking={setIsTracking}
      />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <LocationMarker 
        location={location} 
        shouldZoom={shouldZoom} 
        onZoomComplete={() => setShouldZoom(false)}
        isTracking={isTracking}
      />

      {isSelectingLocation && <MapSelector onSelect={handleMapSelection} />}
      
      {markerGroup}
      
    </MapContainer>
  );
};

export default React.memo(MapComponent);