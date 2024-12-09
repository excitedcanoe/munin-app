/**
 * @file ImageViewer/index.js
 * @description Hovedkomponent for bildevisning med device-aware rendering.
 * Håndterer visning av bilder med zoom, rotering, navigasjon og touch-støtte.
 * 
 * @component
 * @param {string|string[]} props.imageData - Ett bilde eller array av bilder i base64 format
 * @param {Function} props.onClose - Callback for å lukke viseren
 * @param {string} props.registrationId - Unik ID for registreringen bildene tilhører
 * @param {Function} props.onDeleteImage - Callback for sletting av bilder
 */

import React, { useRef, useState } from 'react';
import { useDevice } from '../../../hooks/useDevice';
import { useImageViewer } from '../../../hooks/useImageViewer';
import ImageDisplay from './ImageDisplay';
import ImageControls from './ImageControls';
import ImageThumbnails from './ImageThumbnails';

const ImageViewer = ({ imageData, onClose, registrationId, onDeleteImage }) => {
  const { deviceType, isDesktop } = useDevice();
  const {
    currentImageIndex,
    setCurrentImageIndex,
    history: { past, future },
    zoomLevel,
    setZoomLevel,
    images,
    imageRotations,
    isDragging,
    setIsDragging,
    dragPosition,
    setDragPosition,
    touchStart,
    touchStartTime,
    touchStartDistance,
    lastTouchDistance,
    ZOOM_LEVELS,
    handleUndo,
    handleRedo,
    handleRotate,
    handleDelete
  } = useImageViewer(imageData, onClose, onDeleteImage);

  const imageRef = useRef(null);
  const [showControls, setShowControls] = useState(true);

  const handleMouseDown = (e) => {
    if (ZOOM_LEVELS[zoomLevel] > 1) {
      setIsDragging(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && ZOOM_LEVELS[zoomLevel] > 1) {
      setDragPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (zoomIn) => {
    setZoomLevel(prev => {
      if (zoomIn) {
        return Math.min(prev + 1, ZOOM_LEVELS.length - 1);
      } else {
        return Math.max(prev - 1, 0);
      }
    });
    setDragPosition({ x: 0, y: 0 }); // Reset position når vi zoomer
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistance.current = distance;
      lastTouchDistance.current = distance;
    } else {
      touchStart.current = e.touches[0].clientX;
      touchStartTime.current = Date.now();
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (lastTouchDistance.current) {
        const delta = distance - lastTouchDistance.current;
        if (Math.abs(delta) > 10) {
          setZoomLevel(prev => Math.min(prev + 1, ZOOM_LEVELS.length - 1));
        }
      }
      lastTouchDistance.current = distance;
    } else if (touchStart.current !== null) {
      const diff = touchStart.current - e.touches[0].clientX;
      if (Math.abs(diff) > 50) {
        setCurrentImageIndex(prev => {
          if (diff > 0 && prev < images.length - 1) return prev + 1;
          if (diff < 0 && prev > 0) return prev - 1;
          return prev;
        });
        touchStart.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    touchStart.current = null;
    touchStartTime.current = null;
    lastTouchDistance.current = null;
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    
    if (isDesktop) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const threshold = Math.min(rect.width, rect.height) * 0.3;
    
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );
    
    if (distanceFromCenter < threshold) {
      setShowControls(prev => !prev);
    }
  };

  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains('backdrop')) {
      onClose();
      return;
    }

    const isClickOnControls = e.target.closest('[data-component="image-controls"]');
    const isClickOnThumbnails = e.target.closest('[data-component="thumbnails"]');
    const isClickOnNavButtons = e.target.closest('[data-component="nav-buttons"]');
    const isClickOnImage = e.target.closest('[data-component="image-display"]');
    
    if (!isClickOnControls && !isClickOnThumbnails && !isClickOnNavButtons && !isClickOnImage) {
      onClose();
    }
  };

  if (images.length === 0) {
    onClose();
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 backdrop-blur-sm backdrop"
      onClick={handleBackgroundClick}
    >
      <div className="absolute inset-0 flex flex-col h-[100vh] overflow-hidden">
        <div className="relative flex-1 min-h-0 flex flex-col">
          <div 
            data-component="image-display"
            className="flex-1 flex items-center justify-center min-h-0"
          >
            <ImageDisplay
              imageRef={imageRef}
              currentImage={images[currentImageIndex]}
              rotation={imageRotations[currentImageIndex]}
              zoomLevel={zoomLevel}
              dragPosition={dragPosition}
              isDragging={isDragging}
              ZOOM_LEVELS={ZOOM_LEVELS}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleImageClick}
              deviceType={deviceType}
              onWheel={handleWheel}
            />
          </div>

          {showControls && (
            <div data-component="image-controls">
              <ImageControls
                deviceType={deviceType}
                zoomLevel={zoomLevel}
                ZOOM_LEVELS={ZOOM_LEVELS}
                historyPast={past}
                historyFuture={future}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onRotate={handleRotate}
                onZoomIn={() => setZoomLevel(prev => Math.min(prev + 1, ZOOM_LEVELS.length - 1))}
                onZoomOut={() => setZoomLevel(prev => Math.max(prev - 1, 0))}
                onDelete={() => handleDelete(registrationId)}
                onClose={onClose}
              />
            </div>
          )}

          {images.length > 1 && isDesktop && (
            <div data-component="nav-buttons">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 
                         bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                ←
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 
                         bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                →
              </button>
            </div>
          )}

          {showControls && (
            <div data-component="thumbnails" className="flex-shrink-0">
              <ImageThumbnails
                images={images}
                currentImageIndex={currentImageIndex}
                imageRotations={imageRotations}
                deviceType={deviceType}
                onSelectImage={setCurrentImageIndex}
              />
            </div>
          )}

          {showControls && (
            <div className="absolute top-4 left-4 text-white/75 text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;