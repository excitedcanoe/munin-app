import React, { useEffect } from 'react';


const categoryColors = {
  CO: '#4D4D4D', 
  CR: '#850000', 
  EN: '#FF0000', 
  VU: '#FF4500', 
  NT: '#FFA500', 
  DD: '#FFD700', 
  LC: '#40E0D0', 
  NA: '#808080', 
  NE: '#808080', 
  RE: '#808080', 
  SE: '#800080', 
  HI: '#000080', 
  PH: '#008080', 
  LO: '#40E0D0', 
  NK: '#9ACD32', 
  NR: '#FFFFFF'
};

const getCategory = (species) => {
  if (!species) return 'LC';
  return species.CategoryNorway || species.CategorySvalbard || 'LC';
};

const SpeciesPopup = ({ species, position, onClose, registration, onMapMarkerClick }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!species) return null;

  const category = getCategory(species);
  const backgroundColor = categoryColors[category] || categoryColors.LC;
  const textColor = ['NR', 'DD'].includes(category) ? '#000000' : '#FFFFFF';


  return (
    <div 
      className="fixed bg-white border border-gray-200 shadow-lg rounded-lg p-3 min-w-[200px] -translate-x-1/2 -translate-y-1/2 z-50 cursor-pointer hover:bg-gray-50"
      style={{
        top: position.y - 100,
        left: position.x
      }}
      onClick={() => {
        if (registration && onMapMarkerClick) {
          onMapMarkerClick(registration);
          onClose();
        }
      }}
    >
      <div className="space-y-2">
        <div className="font-medium">{species.VernacularNameBokmaal}</div>
        <div className="text-sm italic text-gray-600">
          {species.Genus} {species.Species}
        </div>
        <div className="flex flex-wrap gap-2">
          {species.CategoryNorway && (
            <span 
              className="px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor,
                color: textColor,
                border: category === 'NR' ? '1px solid #000' : 'none'
              }}
            >
              Norge: {species.CategoryNorway}
            </span>
          )}
          {species.CategorySvalbard && (
            <span 
              className="px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor,
                color: textColor,
                border: category === 'NR' ? '1px solid #000' : 'none'
              }}
            >
              Svalbard: {species.CategorySvalbard}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeciesPopup;