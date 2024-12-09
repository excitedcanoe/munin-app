/**
 * @file ImageUpload.js
 * @description Komponent for opplasting og visning av bilder med:
 * 
 * ImagePreview:
 * - Viser miniatyrbilder i en horisontal scrollbar
 * - Har slett-knapp for hvert bilde
 * - Optimalisert for god ytelse med mange bilder
 * 
 * ImageCounter:
 * - Viser antall valgte bilder vs maksimum tillatt
 * - Styler teksten basert på om grensen er nådd
 * 
 * UploadButton:
 * - Håndterer både kamera og filvelger
 * - Validerer maksantall før opplasting
 * - Trigger komprimering via compressImage
 * 
 * Bildehåndtering:
 * - Komprimerer bilder før lagring
 * - Validerer filtyper og størrelser
 * - Mellomlagrer ved kartnavigasjon
 */

import React, { useRef, useEffect, forwardRef } from 'react';
import { X, Camera, Images } from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';

export const MAX_IMAGES = 9;

const ImageUpload = forwardRef(({
  selectedImages,
  onImagesChange,
  maxImages = MAX_IMAGES,
  selectedCoordinates,
}, ref) => {
  const fileInputRef = useRef(null);

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files);
    const remainingSlots = maxImages - selectedImages.length;
    
    if (files.length > remainingSlots) {
      alert(`Du kan bare velge ${remainingSlots} bilder til. Maksimalt ${maxImages} bilder totalt.`);
      return;
    }
  
    try {
      for (const file of files) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
        
        const compressedImage = await compressImage(base64);
        
        onImagesChange(prev => {
          if (prev.length >= maxImages) return prev;
          return [...prev, {
            id: Date.now() + Math.random(),
            preview: compressedImage,
            file: file
          }];
        });
      }
    } catch (error) {
      console.error('Error processing images:', error);
    }
  };

  useEffect(() => {
    if (selectedCoordinates) {
      const savedState = sessionStorage.getItem('tempFormState');
      if (savedState) {
        const { selectedImages: savedImages } = JSON.parse(savedState);
        onImagesChange(savedImages);
        sessionStorage.removeItem('tempFormState');
      }
    }
  }, [selectedCoordinates, onImagesChange]);

  const handleRemoveImage = (imageId) => {
    onImagesChange(selectedImages.filter(img => img.id !== imageId));
  };

  return (
    <div ref={ref}>
      <div className="flex justify-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => {
            if (selectedImages.length >= maxImages) {
              alert(`Du kan ikke velge flere enn ${maxImages} bilder.`);
              return;
            }
            fileInputRef.current.capture = 'environment';
            fileInputRef.current?.click();
          }}
          className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors"
        >
          <Camera className="w-6 h-6" />
        </button>
        
        <button
          type="button"
          onClick={() => {
            if (selectedImages.length >= maxImages) {
              alert(`Du kan ikke velge flere enn ${maxImages} bilder.`);
              return;
            }
            fileInputRef.current.removeAttribute('capture');
            fileInputRef.current?.click();
          }}
          className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors"
        >
          <Images className="w-6 h-6" />
        </button>
      </div>

      {selectedImages.length > 0 && (
        <div className="flex overflow-x-auto mb-2 pb-1">
          {selectedImages.map((image) => (
            <div 
              key={image.id} 
              className="relative flex-shrink-0 mr-2"
            >
              <img
                src={image.preview}
                alt="Forhåndsvisning"
                className="h-[60px] w-auto object-contain border border-gray-200 rounded"
              />
              <button
                onClick={() => handleRemoveImage(image.id)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 flex items-center justify-center w-4 h-4"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedImages.length > 0 && (
        <div className="text-sm text-gray-500">
          {`${selectedImages.length} av ${maxImages} bilder valgt`}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
      />
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;