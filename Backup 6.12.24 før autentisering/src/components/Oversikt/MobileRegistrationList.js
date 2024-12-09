import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Camera, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle,
  Calendar,
  Target
} from 'lucide-react';

const CommentPopover = ({ comment, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg p-4 max-w-sm w-full shadow-lg" 
        onClick={e => e.stopPropagation()}
      >
        <div className="font-medium mb-2">Kommentar</div>
        <p className="text-gray-600 whitespace-pre-wrap">{comment}</p>
        <button 
          className="mt-4 text-blue-500 w-full text-center"
          onClick={onClose}
        >
          Lukk
        </button>
      </div>
    </div>
  );
};

const RegistrationCard = ({ 
  registration, 
  isSelected, 
  onSelect, 
  onMapPin, 
  onImageClick, 
  onSpeciesClick 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComment, setShowComment] = useState(false);

  const formatTime = (timeString) => timeString || '-';
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('no', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '.');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-2 overflow-hidden">
      <div className="p-4">
        {/* Header med checkbox og artsnavn */}
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4"
          />
          <button 
            onClick={(e) => onSpeciesClick(registration.species, e)}
            className="flex-1 text-left font-medium hover:text-blue-500"
          >
            {registration.species?.VernacularNameBokmaal || registration.artsNavn}
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 p-1"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Primær informasjon - alltid synlig */}
        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            {formatTime(registration.time)}
          </div>
          
          <button 
            onClick={(e) => onMapPin(registration, e)}
            className="flex items-center gap-1 text-blue-500"
            title={`${registration.breddegrad}, ${registration.lengdegrad}`}
          >
            <MapPin size={16} />
            Vis i kart
          </button>

          {registration.images?.length > 0 && (
            <button
              onClick={() => onImageClick(registration.images, registration.id)}
              className="flex items-center gap-1 text-blue-500"
            >
              <Camera size={16} />
              {registration.images.length > 1 ? `${registration.images.length} bilder` : '1 bilde'}
            </button>
          )}

          {registration.comment && (
            <button
              onClick={() => setShowComment(true)}
              className="flex items-center gap-1 text-blue-500"
            >
              <MessageCircle size={16} />
              Vis kommentar
            </button>
          )}
        </div>

        {/* Ekspandert innhold */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>Dato: {formatDate(registration.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-gray-400" />
                <span>Nøyaktighet: {registration.noyaktighet}m</span>
              </div>
              {registration.comment && (
                <div className="flex items-start gap-2">
                  <MessageCircle size={16} className="text-gray-400 mt-1" />
                  <span className="flex-1">
                    Kommentar: {registration.comment}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Kommentar popover */}
      <CommentPopover 
        comment={registration.comment}
        isOpen={showComment}
        onClose={() => setShowComment(false)}
      />
    </div>
  );
};

const MobileRegistrationList = ({ 
  registrations, 
  selectedRegistrations, 
  onSelectionChange,
  onSpeciesClick, 
  onImageClick, 
  onMapPin 
}) => {
  return (
    <div className="space-y-2">
      {Object.entries(registrations).map(([regKey, reg]) => (
        <RegistrationCard
          key={regKey}
          registration={reg}
          isSelected={selectedRegistrations[regKey] || false}
          onSelect={(checked) => {
            onSelectionChange({ 
              ...selectedRegistrations, 
              [regKey]: checked 
            });
          }}
          onSpeciesClick={onSpeciesClick}
          onImageClick={onImageClick}
          onMapPin={onMapPin}
        />
      ))}
    </div>
  );
};

export default MobileRegistrationList;