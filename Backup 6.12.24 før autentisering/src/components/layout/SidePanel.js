/**
 * @file SidePanel.js
 * @description Komponent for sidepanelet i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Viser brukerinformasjon og statistikk.
 * 2. Presenterer en meny med ulike app-funksjoner.
 * 3. Håndterer utlogging av brukeren.
 * 4. Viser app-versjon og antall arter i databasen.
 * 
 * Komponentstruktur:
 * - Overlay: Halvgjennomsiktig bakgrunn som lukker panelet ved klikk utenfor.
 * - Sidepanel: Hovedcontainer for panelinnholdet.
 * - Header: Viser brukerinfo og lukkeknapp.
 * - Versjonsinfo: Viser app-versjon og artsantall.
 * - Meny: Liste over app-funksjoner og innstillinger.
 * 
 * Viktig for videre utvikling:
 * - Implementere funksjonalitet for hver menyoppføring.
 * - Legge til mer detaljert brukerstatistikk og achievements.
 * - Vurdere å implementere en mer dynamisk menystruktur basert på brukerrettigheter.
 */

import React from 'react';
import { X, Camera } from 'lucide-react';
import { resetAppData } from '../../utils/resetAppData';

const SidePanel = ({ isSidePanelOpen, setIsSidePanelOpen, user, handleLogout, currentVersion, speciesCount }) => {
  const [showOverlay, setShowOverlay] = React.useState(false);

  const handleResetApp = () => {
    if (window.confirm("Er du sikker på at du vil tilbakestille alle app-data? Dette kan ikke angres.")) {
      resetAppData();
    }
  };

  React.useEffect(() => {
    setShowOverlay(isSidePanelOpen);
  }, [isSidePanelOpen]);

  React.useEffect(() => {
    if (isSidePanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidePanelOpen]);

  const handleOutsideClick = (e) => {
    e.stopPropagation();
    setIsSidePanelOpen(false);
  };

  return (
    <>
      {/* Overlay som vises når sidepanelet er åpent */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={handleOutsideClick}
        />
      )}

      {/* Hovedcontainer for sidepanelet */}
      <div className={`
        absolute 
        top-0 
        ${isSidePanelOpen ? 'left-0' : '-left-full'}
        w-4/5 
        h-full 
        bg-cyan-900 
        transition-left 
        duration-300 
        p-4 
        text-white 
        z-[51] 
        pointer-events-auto
      `}>
        {/* Sidepanelets header med brukerinfo */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-white flex justify-center items-center mr-4">
            <Camera className="text-cyan-900" size={24} />
          </div>
          <div>
            {user ? (
              <>
                <h3 className="m-0">{`${user.firstName} ${user.lastName}`}</h3>
                <p className="m-0 text-sm">296 arter registrert (648# i Norge)</p>
                <p className="m-0 text-sm">1132 registreringer (298# i Norge)</p>
              </>
            ) : (
              <h3 className="m-0">Ikke logget inn</h3>
            )}
          </div>
          <X 
            onClick={() => setIsSidePanelOpen(false)} 
            className="cursor-pointer ml-auto" 
          />
        </div>
        {/* Versjonsinfo */}
        <div className="mb-4">
          <p className="m-0 text-sm">Versjon: {currentVersion}</p>
          <p className="m-0 text-sm">Antall taksoner: {speciesCount}</p>
        </div>
        {/* Menyoppføringer */}
        {user && (
          ['Mine registreringer', 'Administrer kart', 'Artsdata', 'Statistikk', 'Konto', 'Innstillinger', 'Om', 'Logg ut', 'Tilbakestill App'].map((item, index) => (
            <div 
              key={index} 
              className={`
                py-2 
                ${index < 4 ? 'border-b border-white border-opacity-20' : ''} 
                ${index === 4 || index === 7 || index === 8 ? 'mt-4' : ''}
              `}
            >
              <span
                className={`
                  ${(item === 'Logg ut' || item === 'Tilbakestill App') ? 'cursor-pointer' : 'cursor-default'}
                  inline-block 
                  py-1 
                  px-2
                  hover:bg-cyan-800
                  rounded
                  transition-colors
                `}
                onClick={
                  item === 'Logg ut' 
                    ? handleLogout 
                    : item === 'Tilbakestill App' 
                      ? handleResetApp 
                      : undefined
                }
              >
                {item}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default SidePanel;