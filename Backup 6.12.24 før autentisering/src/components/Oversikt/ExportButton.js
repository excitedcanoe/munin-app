import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { generateExcel } from '../../utils/excel-export-utils';

const ExportButton = ({ selectedRegistrations, location, disabled }) => {
  const handleExport = () => {
    const registrationsToExport = Object.entries(selectedRegistrations)
      .filter(([_, isSelected]) => isSelected)
      .map(([regKey]) => location.registreringer[regKey]);

    if (registrationsToExport.length === 0) {
      alert('Velg minst én registrering å eksportere');
      return;
    }

    try {
      generateExcel(registrationsToExport, location.navn);
    } catch (error) {
      console.error('Feil ved eksport:', error);
      alert('Det oppstod en feil under eksporten. Prøv igjen senere.');
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      className="px-4 py-2 bg-green-500 text-white rounded-md disabled:opacity-50 
                 disabled:cursor-not-allowed flex items-center hover:bg-green-600"
    >
      <FileSpreadsheet className="mr-2" size={16} />
      Eksporter til Excel
    </button>
  );
};

export default ExportButton;