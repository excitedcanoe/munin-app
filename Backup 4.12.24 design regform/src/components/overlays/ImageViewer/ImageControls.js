/**
 * @file ImageControls.js
 * @description Komponent for kontrollknapper med responsivt design
 * basert på enhetstype.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.deviceType - Enhetstype (phone/tablet/desktop)
 * @param {number} props.zoomLevel - Gjeldende zoom-nivå
 * @param {number[]} props.ZOOM_LEVELS - Tilgjengelige zoom-nivåer
 * @param {Array} props.historyPast - Historie for undo
 * @param {Array} props.historyFuture - Historie for redo
 */

import React from 'react';
import { X, Trash2, ZoomIn, ZoomOut, RotateCcw, Undo, Redo } from 'lucide-react';

const ImageControls = ({
  deviceType,
  zoomLevel,
  ZOOM_LEVELS,
  historyPast,
  historyFuture,
  onUndo,
  onRedo,
  onRotate,
  onZoomIn,
  onZoomOut,
  onDelete,
  onClose
}) => {
  const iconSize = deviceType === 'phone' ? 24 : 20;

  const ControlButtons = () => (
    <>
      <button 
        onClick={onUndo}
        disabled={historyPast.length === 0}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors 
                  disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Undo size={iconSize} className="text-white" />
      </button>
      <button 
        onClick={onRedo}
        disabled={historyFuture.length === 0}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors 
                  disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Redo size={iconSize} className="text-white" />
      </button>
      <button 
        onClick={onRotate}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      >
        <RotateCcw size={iconSize} className="text-white" />
      </button>

      {deviceType !== 'phone' && (
        <>
          <button 
            onClick={onZoomIn}
            disabled={zoomLevel === ZOOM_LEVELS.length - 1}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors 
                      disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomIn size={iconSize} className="text-white" />
          </button>
          <button 
            onClick={onZoomOut}
            disabled={zoomLevel === 0}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors 
                      disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomOut size={iconSize} className="text-white" />
          </button>
        </>
      )}

      <button 
        onClick={onDelete}
        className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full transition-colors"
      >
        <Trash2 size={iconSize} className="text-white" />
      </button>
      <button 
        onClick={onClose}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={iconSize} className="text-white" />
      </button>
    </>
  );

  const containerClasses = {
    phone: "fixed bottom-20 left-0 right-0 flex justify-center gap-4",
    tablet: "fixed top-4 right-4 flex gap-2",
    desktop: "fixed top-4 right-4 flex gap-2"
  }[deviceType];

  return (
    <div className={containerClasses}>
      <ControlButtons />
    </div>
  );
};

export default ImageControls;