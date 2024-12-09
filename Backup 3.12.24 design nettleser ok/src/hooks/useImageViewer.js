/**
 * @file useImageViewer.js
 * @description Custom hook for håndtering av all state og logikk
 * relatert til bildevisning, inkludert zoom, rotering, navigasjon
 * og touch-interaksjoner.
 * 
 * @param {string|string[]} imageData - Bilde(r) som skal vises
 * @param {Function} onClose - Callback for lukking
 * @param {Function} onDeleteImage - Callback for sletting
 * @returns {Object} State og handlers for bildevisning
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const useImageViewer = (imageData, onClose, onDeleteImage) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [images, setImages] = useState(() => {
    return Array.isArray(imageData) ? imageData : imageData ? [imageData] : [];
  });
  const [imageRotations, setImageRotations] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState({
    past: [],
    present: {
      images: Array.isArray(imageData) ? imageData : imageData ? [imageData] : [],
      rotations: {},
      currentIndex: 0
    },
    future: []
  });

  const touchStart = useRef(null);
  const touchStartTime = useRef(null);
  const touchStartDistance = useRef(null);
  const lastTouchDistance = useRef(null);

  const ZOOM_LEVELS = [1, 1.5, 2, 3];

  const pushToHistory = useCallback((newState) => {
    setHistory(prev => ({
      past: [...prev.past, {
        images: [...prev.present.images],
        rotations: {...prev.present.rotations},
        currentIndex: currentImageIndex
      }],
      present: newState,
      future: []
    }));
  }, [currentImageIndex]);

  const handleUndo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
  
      const lastPast = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);
      
      setImages(lastPast.images);
      setImageRotations(lastPast.rotations);
      setCurrentImageIndex(lastPast.currentIndex);
  
      return {
        past: newPast,
        present: lastPast,
        future: [prev.present, ...prev.future]
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
  
      const [nextFuture, ...remainingFuture] = prev.future;
      
      setImages(nextFuture.images);
      setImageRotations(nextFuture.rotations);
      setCurrentImageIndex(nextFuture.currentIndex);
  
      return {
        past: [...prev.past, prev.present],
        present: nextFuture,
        future: remainingFuture
      };
    });
  }, []);

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

  const handleDelete = useCallback((registrationId) => {
    if (window.confirm('Er du sikker på at du vil slette dette bildet?')) {
      const currentState = {
        images: [...images],
        rotations: {...imageRotations},
        currentIndex: currentImageIndex
      };
      
      const newImages = images.filter((_, index) => index !== currentImageIndex);
      const newIndex = currentImageIndex >= newImages.length ? newImages.length - 1 : currentImageIndex;
      
      setHistory(prev => ({
        past: [...prev.past, currentState],
        present: {
          images: newImages,
          rotations: imageRotations,
          currentIndex: newIndex
        },
        future: []
      }));
      
      setImages(newImages);
    setCurrentImageIndex(newIndex);
    
    if (newImages.length === 0) {
      onClose();
    } else {
      onDeleteImage(registrationId, newImages);
    }
  }
}, [images, currentImageIndex, imageRotations, onDeleteImage, onClose]);

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
    if (imageData) {
      const initialImages = Array.isArray(imageData) ? imageData : [imageData];
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

  return {
    currentImageIndex,
    setCurrentImageIndex,
    zoomLevel,
    setZoomLevel,
    images,
    imageRotations,
    isDragging,
    setIsDragging,
    dragPosition,
    setDragPosition,
    history,
    touchStart,
    touchStartTime,
    touchStartDistance,
    lastTouchDistance,
    ZOOM_LEVELS,
    handleUndo,
    handleRedo,
    handleRotate,
    handleDelete
  };
};