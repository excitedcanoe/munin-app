/**
 * @file ImageViewer.js
 * @description En avansert bildeviser-komponent med støtte for:
 * - Visning av enkelt eller multiple bilder
 * - Bildenavigasjon (tastatur, sveip, klikk)
 * - Zoom og pan funksjonalitet
 * - Rotering av bilder
 * - Thumbnail-navigasjon
 * - Undo/Redo historikk
 * - Touch-støtte for mobil
 * - Responsive kontroller for desktop/mobil
 * 
 * @requires react
 * @requires lucide-react - For ikoner
 * 
 * @param {object} props
 * @param {string|string[]} props.imageData - Ett bilde eller array av bilder i base64 format
 * @param {function} props.onClose - Callback for å lukke viseren
 * @param {string} props.registrationId - Unik ID for registreringen bildene tilhører
 * @param {function} props.onDeleteImage - Callback for sletting av bilder
 *                   Signature: (registrationId: string, updatedImages: string[]) => void
 * 
 * @example
 * <ImageViewer
 *   imageData={['base64-string-1', 'base64-string-2']}
 *   onClose={() => setShowViewer(false)}
 *   registrationId="123"
 *   onDeleteImage={(id, images) => handleImageDelete(id, images)}
 * />
 * 
 * Nøkkelfunksjoner:
 * - Tastaturnavigasjon: Piltaster (←/→), Esc for lukking
 * - Undo/Redo: Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z
 * - Touch: Sveip for navigasjon, pinch for zoom
 * - Rotering lagres per bilde
 * - Støtter opptil 9 bilder per registrering
 * 
 * Mobiloptimalisering:
 * - Thumb-vennlig kontrollplassering
 * - Forenklet navigasjon med dots
 * - Responsiv layout < 768px
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Trash2, ZoomIn, ZoomOut, RotateCcw, Undo, Redo } from 'lucide-react';

const ZOOM_LEVELS = [1, 1.5, 2, 3];

const ImageViewer = ({ imageData, onClose, registrationId, onDeleteImage }) => {
  console.log('ImageViewer mounted with props:', { imageData, registrationId });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [images, setImages] = useState(() => {
    console.log('Initializing images state with:', imageData);
    return Array.isArray(imageData) ? imageData : imageData ? [imageData] : [];
  });
  const [imageRotations, setImageRotations] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  
  const [history, setHistory] = useState({
    past: [],
    present: {
      images: Array.isArray(imageData) ? imageData : imageData ? [imageData] : [],
      rotations: {}
    },
    future: []
  });
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const touchStart = useRef(null);
  const touchStartTime = useRef(null);
  const touchStartDistance = useRef(null);
  const thumbnailsRef = useRef(null);
  const lastTouchDistance = useRef(null);

  const pushToHistory = useCallback((newState) => {
    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: newState,
      future: []
    }));
  }, []);

  const handleUndo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];

      setImages(newPresent.images);
      setImageRotations(newPresent.rotations);

      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future]
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;

      const newFuture = prev.future.slice(1);
      const newPresent = prev.future[0];

      setImages(newPresent.images);
      setImageRotations(newPresent.rotations);

      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture
      };
    });
  }, []);

  const handleKeyboardShortcuts = useCallback((e) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
        break;
      case 'ArrowRight':
        setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
        break;
      case 'z':
        if (e.metaKey || e.ctrlKey) {
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        }
        break;
      default:
        break;
    }
  }, [onClose, images.length, handleRedo, handleUndo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (imageData) {
      console.log('useEffect triggered with imageData:', imageData);
      const initialImages = Array.isArray(imageData) ? imageData : [imageData];
      console.log('Processed images:', initialImages);
      setImages(initialImages);
      setHistory(prev => ({
        past: [],
        present: {
          images: initialImages,
          rotations: {}
        },
        future: []
      }));
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [imageData]);

  const handleRotate = useCallback(() => {
    setImageRotations(prev => {
      const newRotations = { ...prev };
      newRotations[currentImageIndex] = (prev[currentImageIndex] || 0) - 90;
      
      pushToHistory({
        images,
        rotations: newRotations
      });
      
      return newRotations;
    });
  }, [currentImageIndex, images, pushToHistory]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 1, ZOOM_LEVELS.length - 1));
    setDragPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 1, 0));
    setDragPosition({ x: 0, y: 0 });
  }, []);

  const handleDelete = useCallback(() => {
    if (window.confirm('Er du sikker på at du vil slette dette bildet?')) {
      const updatedImages = images.filter((_, index) => index !== currentImageIndex);
      setImages(updatedImages);
      
      pushToHistory({
        images: updatedImages,
        rotations: imageRotations
      });
      
      onDeleteImage(registrationId, updatedImages);
      
      if (updatedImages.length === 0) {
        onClose();
      } else {
        setCurrentImageIndex(prev => 
          prev >= updatedImages.length ? updatedImages.length - 1 : prev
        );
      }
    }
  }, [images, currentImageIndex, onDeleteImage, registrationId, onClose, imageRotations, pushToHistory]);

  const handleMouseDown = useCallback((e) => {
    if (ZOOM_LEVELS[zoomLevel] > 1) {
      setIsDragging(true);
      e.preventDefault();
    }
  }, [zoomLevel]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && ZOOM_LEVELS[zoomLevel] > 1) {
      setDragPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  }, [isDragging, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
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
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (lastTouchDistance.current) {
        const delta = distance - lastTouchDistance.current;
        if (Math.abs(delta) > 10) {
          handleZoomIn();
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
  }, [handleZoomIn, images.length]);

  const handleTouchEnd = useCallback(() => {
    if (touchStartTime.current && Date.now() - touchStartTime.current < 300) {
      if (ZOOM_LEVELS[zoomLevel] > 1) {
        setZoomLevel(0);
        setDragPosition({ x: 0, y: 0 });
      } else {
        setZoomLevel(1);
      }
    }
    touchStart.current = null;
    touchStartTime.current = null;
    lastTouchDistance.current = null;
  }, [zoomLevel]);

  if (images.length === 0) {
    console.log('No images, closing viewer');
    onClose();
    return null;
  }

  console.log('Rendering viewer with images:', images.length);
  
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 md:inset-[5%] flex flex-col">
        {/* Main Image Container */}
        <div 
          className="relative flex-1 flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img 
            ref={imageRef}
            src={images[currentImageIndex]} 
            alt={`Bilde ${currentImageIndex + 1} av ${images.length}`}
            className={`
              max-w-[90%] max-h-[80vh] object-contain transition-transform duration-200
              ${isDragging ? 'cursor-grabbing' : ZOOM_LEVELS[zoomLevel] > 1 ? 'cursor-grab' : ''}
            `}
            style={{
              transform: `
                translate(${dragPosition.x}px, ${dragPosition.y}px) 
                rotate(${imageRotations[currentImageIndex] || 0}deg) 
                scale(${ZOOM_LEVELS[zoomLevel]})
              `
            }}
          />
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex absolute top-4 right-4 gap-2">
          <button 
            onClick={handleUndo}
            disabled={history.past.length === 0}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Undo size={20} className="text-white" />
          </button>
          <button 
            onClick={handleRedo}
            disabled={history.future.length === 0}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Redo size={20} className="text-white" />
          </button>
          <button 
            onClick={handleRotate}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <RotateCcw size={20} className="text-white" />
          </button>
          <button 
            onClick={handleZoomIn}
            disabled={zoomLevel === ZOOM_LEVELS.length - 1}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomIn size={20} className="text-white" />
          </button>
          <button 
            onClick={handleZoomOut}
            disabled={zoomLevel === 0}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomOut size={20} className="text-white" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full transition-colors"
          >
            <Trash2 size={20} className="text-white" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && !isMobile && (
          <>
            <button 
              onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 
                       bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              ←
            </button>
            <button 
              onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 
                       bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              →
            </button>
          </>
        )}

        {/* Thumbnails */}
        <div 
          ref={thumbnailsRef}
          className="hidden md:flex h-24 mt-auto mx-4 mb-6 justify-center gap-2 
                   overflow-x-auto scroll-smooth px-4 py-2"
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`
                flex-shrink-0 w-20 h-full rounded-lg overflow-hidden transition-all
                ${index === currentImageIndex ? 'ring-2 ring-white scale-105' : 'opacity-50 hover:opacity-75'}
              `}
            >
              <img
                src={images[index]}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                style={{
                  transform: `rotate(${imageRotations[index] || 0}deg)`
                }}
              />
            </button>
          ))}
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden fixed bottom-20 left-0 right-0 flex justify-center gap-4">
          <button 
            onClick={handleUndo}
            disabled={history.past.length === 0}
            className="p-3 bg-white/10 rounded-full disabled:opacity-50"
          >
            <Undo size={24} className="text-white" />
          </button>
          <button 
            onClick={handleRedo}
            disabled={history.future.length === 0}
            className="p-3 bg-white/10 rounded-full disabled:opacity-50"
          >
            <Redo size={24} className="text-white" />
          </button>
          <button 
            onClick={handleRotate}
            className="p-3 bg-white/10 rounded-full"
          >
            <RotateCcw size={24} className="text-white" />
          </button>
          <button 
            onClick={handleZoomIn}
            disabled={zoomLevel === ZOOM_LEVELS.length - 1}
            className="p-3 bg-white/10 rounded-full disabled:opacity-50"
          >
            <ZoomIn size={24} className="text-white" />
          </button>
          <button 
            onClick={handleZoomOut}
            disabled={zoomLevel === 0}
            className="p-3 bg-white/10 rounded-full disabled:opacity-50"
          >
            <ZoomOut size={24} className="text-white" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-3 bg-red-500/80 rounded-full"
          >
            <Trash2 size={24} className="text-white" />
          </button>
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 rounded-full"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Mobile Dots */}
        <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all
                ${index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}
              `}
            />
          ))}
        </div>

        {/* Image Counter */}
        <div className="absolute top-4 left-4 text-white/75 text-sm">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;