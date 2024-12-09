/**
 * @file ImageThumbnails.js
 * @description Komponent for visning av miniatyrbilder med
 * device-spesifikk styling og layout.
 * 
 * @component
 * @param {Object} props
 * @param {string[]} props.images - Array med bilder
 * @param {number} props.currentImageIndex - Indeks for aktivt bilde
 * @param {Object} props.imageRotations - Rotasjoner for hvert bilde
 * @param {string} props.deviceType - Enhetstype (phone/tablet/desktop)
 */

import React from 'react';

const ImageThumbnails = ({
  images,
  currentImageIndex,
  imageRotations,
  deviceType,
  onSelectImage
}) => {
  const containerStyles = {
    phone: {
      containerClass: "absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto",
      thumbnailSize: "w-16 h-16"
    },
    tablet: {
      containerClass: "absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-6 overflow-x-auto",
      thumbnailSize: "w-20 h-20"
    },
    desktop: {
      containerClass: "absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-6 overflow-x-auto",
      thumbnailSize: "w-24 h-24"
    }
  }[deviceType];

  return (
    <div className={`${containerStyles.containerClass} scroll-smooth py-2`}>
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onSelectImage(index)}
          className={`
            flex-shrink-0 ${containerStyles.thumbnailSize} 
            rounded-lg overflow-hidden transition-all
            ${index === currentImageIndex 
              ? 'ring-2 ring-white scale-105' 
              : 'opacity-50 hover:opacity-75'
            }
          `}
        >
          <div className="w-full h-full relative">
            <img
              src={image}
              alt={`Miniatyrbilde ${index + 1}`}
              className="w-full h-full object-cover"
              style={{
                transform: `rotate(${imageRotations[index] || 0}deg)`
              }}
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default ImageThumbnails;