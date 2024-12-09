/**
 * @file PopupContent.js
 * @description Komponent for visning av registreringsdetaljer i popup-vinduer på kartet.
 * 
 * Hovedfunksjoner:
 * 1. Viser detaljert informasjon om artsregistreringer
 * 2. Håndterer visning av multiple registreringer på samme lokasjon
 * 3. Implementerer scrolling for mange registreringer
 * 
 * Props:
 * @param {Array} registrations - Array med registreringer som skal vises
 * @param {Function} onSelect - Callback-funksjon for når en registrering velges
 * 
 * Styling:
 * - Tilpasset visning med fast høyde per registrering
 * - Automatisk scrolling ved mange registreringer
 * - Visuell indikering av kategori med farger og ikoner
 */

import React from 'react';
import CategoryIcon from './CategoryIcon';
import { categoryColors, getCategory } from './mapUtils';

const PopupContent = React.memo(({ registrations, onSelect }) => {
  console.log('📝 PopupContent rendering with registrations:', registrations);

   /**
   * Rendrer en liste av registreringer i en scrollbar container
   * Hver registrering vises med:
   * - Fargekodet punktindikator
   * - Artsnavn
   * - Dato og tid
   * - Kategoriikon
   */
  
   const sortedRegistrations = [...registrations].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
    const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
    return dateB - dateA;
  });

  const itemHeight = 54;
  const maxItems = 5;
  const contentHeight = sortedRegistrations.length <= maxItems 
    ? sortedRegistrations.length * itemHeight 
    : maxItems * itemHeight;

  return (
    <div className="min-w-[240px] relative bg-white overflow-y-auto pb-0" 
         style={{ 
           height: contentHeight,
           maxHeight: maxItems * itemHeight
         }}>
      {sortedRegistrations.map((reg, index) => {
        const category = getCategory(reg);
        const color = categoryColors[category];
        
        return (
          <div 
            key={reg.id}
            onClick={(e) => {
              e.stopPropagation();
              console.log('🖱️ Popup clicked, sending registration:', reg);
              if (onSelect) {
                e.preventDefault();
                onSelect(reg);
              }
            }}
            className={`
              p-2 
              flex 
              items-center 
              gap-2 
              min-h-[40px] 
              cursor-pointer
              hover:bg-gray-50
              ${index < sortedRegistrations.length - 1 ? 'border-b border-gray-200' : ''}
            `}
          >
            <div 
              className="w-4 h-4 rounded-full border border-black flex-shrink-0" 
              style={{ backgroundColor: color }}
            />
            
            <div className="flex-1">
              <strong className="text-sm block mb-0.5">
                {reg.speciesInput}
              </strong>
              <div className="text-xs text-gray-600">
                {reg.date} {reg.time}
              </div>
            </div>
            
            <CategoryIcon 
              category={category} 
              style={{
                backgroundColor: color,
                color: category === 'NR' ? '#000' : '#fff',
                border: category === 'NR' ? '1px solid rgba(0,0,0,0.3)' : 'none',
                width: '20px',
                height: '20px',
                fontSize: '10px'
              }}
            />
          </div>
        );
      })}
    </div>
  );
});

export default PopupContent;