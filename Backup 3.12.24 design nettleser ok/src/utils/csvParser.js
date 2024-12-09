/**
 * @file csvParser.js
 * @description Modul for parsing og konvertering av CSV-data til artsformat.
 * 
 * Hovedfunksjoner:
 * 1. Parser CSV-tekst til et array av objekter.
 * 2. Konverterer parsede CSV-data til et standardisert artsformat.
 * 
 * Viktig for videre utvikling:
 * - Legge til feilhåndtering for ugyldig CSV-input.
 * - Implementere støtte for ulike CSV-formater og skilletegn.
 * - Vurdere å legge til valideringslogikk for artsdata.
 */

/**
 * Parser CSV-tekst til et array av objekter.
 * @param {string} csvText - CSV-teksten som skal parses.
 * @returns {Array} Array av objekter representerer CSV-radene.
 */
export function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index] ? values[index].trim() : '';
      return obj;
    }, {});
  });
}

/**
 * Konverterer parsede CSV-data til standardisert artsformat.
 * @param {Array} csvData - Array av objekter fra parseCSV-funksjonen.
 * @returns {Array} Array av objekter i standardisert artsformat.
 */
export function convertToSpeciesFormat(csvData) {
  return csvData.map((row, index) => ({
    id: `species_${index}`,
    scientificName: row.Art || '',
    commonNameNorwegian: row.PopulærnavnBokmål || '',
    commonNameNynorsk: row.PopulærnavnNynorsk || '',
    commonNameSami: row.PopulærnavnSamisk || '',
    kingdom: row.Rike || '',
    phylum: row.Rekke || '',
    class: row.Klasse || '',
    order: row.Orden || '',
    family: row.Familie || '',
    genus: row.Slekt || '',
    species: row.Art || '',
    subspecies: row.Underart || '',
    variety: row.Varietet || '',
    form: row.Form || '',
    status: row.Hovedstatus || '',
    existsInNorway: row.FinnesINorge || '',
  }));
}