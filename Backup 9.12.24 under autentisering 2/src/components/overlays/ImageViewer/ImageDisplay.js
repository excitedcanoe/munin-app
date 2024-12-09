/**
 * @file ImageDisplay.js
 * @description Komponent for visning av hovedbilde med støtte for
 * zoom, pan og touch-interaksjoner.
 * 
 * @component
 * @param {Object} props
 * @param {React.RefObject} props.imageRef - Referanse til bildeelementet
 * @param {string} props.currentImage - Gjeldende bilde som skal vises
 * @param {number} props.rotation - Rotasjonsgrad for bildet
 * @param {number} props.zoomLevel - Gjeldende zoom-nivå
 * @param {Object} props.dragPosition - X/Y posisjon for drag
 * @param {boolean} props.isDragging - Om bildet blir dradd
 * @param {number[]} props.ZOOM_LEVELS - Tilgjengelige zoom-nivåer
 * @param {string} props.deviceType - Enhetstype (phone/tablet/desktop)
 */

import React from 'react';

const ImageDisplay = ({
  imageRef,
  currentImage,
  rotation,
  zoomLevel,
  dragPosition,
  isDragging,
  ZOOM_LEVELS,
  deviceType,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onClick,
  onWheel
}) => {
  const handleWheel = (e) => {
    if (deviceType !== 'desktop') return;
    
    e.preventDefault();
    
    if (e.ctrlKey || Math.abs(e.deltaY) > 50) {
      onWheel(e.deltaY < 0);
    }
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center p-4"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      onWheel={handleWheel}
    >
      <img 
        ref={imageRef}
        src={currentImage} 
        alt={`Bilde`}
        className={`
          max-w-[95%] max-h-[85vh] w-auto h-auto object-contain 
          transition-transform duration-200
          ${isDragging ? 'cursor-grabbing' : ZOOM_LEVELS[zoomLevel] > 1 ? 'cursor-grab' : ''}
        `}
        style={{
          transform: `
            translate(${dragPosition.x}px, ${dragPosition.y}px) 
            rotate(${rotation || 0}deg) 
            scale(${ZOOM_LEVELS[zoomLevel]})
          `
        }}
      />
    </div>
  );
};

export default ImageDisplay;