import { Workbook } from 'exceljs';
import proj4 from 'proj4';

// Helper for å finne UTM-sone basert på lengdegrad
const getUTMZone = (longitude) => {
  return Math.floor((longitude + 180) / 6) + 1;
};

// Helper for å bestemme hemisphere
const getHemisphere = (latitude) => {
  return latitude >= 0 ? 'N' : 'S';
};

// Helper for å generere proj4-streng for en gitt UTM-sone
const getUTMProj4String = (zone, hemisphere) => {
  return `+proj=utm +zone=${zone} ${hemisphere === 'S' ? '+south' : ''} +datum=WGS84 +units=m +no_defs`;
};

// Konverterer koordinater til UTM for en spesifikk sone
const convertToUTM = (lat, lng, zone, hemisphere) => {
  const proj4String = getUTMProj4String(zone, hemisphere);
  proj4.defs(`EPSG:${32600 + zone}`, proj4String);
  const [easting, northing] = proj4("EPSG:4326", `EPSG:${32600 + zone}`, [lng, lat]);
  return {
    northing: Math.round(northing),
    easting: Math.round(easting)
  };
};

// Formatterer dato
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('no', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '.');
};

// Helper for å opprette WGS84 worksheet
const createWGS84Worksheet = (workbook) => {
  const worksheet = workbook.addWorksheet('WGS84');
  worksheet.columns = [
    { header: 'Artsnavn', key: 'artsnavn', width: 20 },
    { header: 'Lokalitetsnavn', key: 'lokalitetsnavn', width: 20 },
    { header: 'Breddegrad', key: 'breddegrad', width: 12 },
    { header: 'Lengdegrad', key: 'lengdegrad', width: 12 },
    { header: 'Nøyaktighet', key: 'noyaktighet', width: 12 },
    { header: 'Fra dato', key: 'fraDato', width: 12 },
    { header: 'Til dato', key: 'tilDato', width: 12 },
    { header: 'Fra klokkes lett', key: 'fraKlokke', width: 15 },
    { header: 'Til klokkes lett', key: 'tilKlokke', width: 15 },
    { header: 'Kategori Norge', key: 'kategoriNorge', width: 15 },
    { header: 'Kategori Svalbard', key: 'kategoriSvalbard', width: 15 },
    { header: 'Kommentar', key: 'kommentar', width: 30 }
  ];
  
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  return worksheet;
};

// Helper for å opprette UTM worksheet
const createUTMWorksheet = (workbook, zoneName) => {
  const worksheet = workbook.addWorksheet(zoneName);
  worksheet.columns = [
    { header: 'Artsnavn', key: 'artsnavn', width: 20 },
    { header: 'Lokalitetsnavn', key: 'lokalitetsnavn', width: 20 },
    { header: 'Nord', key: 'nord', width: 12 },
    { header: 'Øst', key: 'ost', width: 12 },
    { header: 'Nøyaktighet', key: 'noyaktighet', width: 12 },
    { header: 'Fra dato', key: 'fraDato', width: 12 },
    { header: 'Til dato', key: 'tilDato', width: 12 },
    { header: 'Fra klokkes lett', key: 'fraKlokke', width: 15 },
    { header: 'Til klokkes lett', key: 'tilKlokke', width: 15 },
    { header: 'Kategori Norge', key: 'kategoriNorge', width: 15 },
    { header: 'Kategori Svalbard', key: 'kategoriSvalbard', width: 15 },
    { header: 'Kommentar', key: 'kommentar', width: 30 }
  ];
  
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  return worksheet;
};

export const generateExcel = async (selectedRegistrations, locationName) => {
  try {
    const workbook = new Workbook();
    workbook.creator = 'Karplanter App';
    workbook.lastModifiedBy = 'Karplanter App';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Opprett WGS84 sheet
    const wgs84Sheet = createWGS84Worksheet(workbook);

    // Gruppér registreringer etter UTM-sone
    const registrationsByZone = {};

    // Legg til alle registreringer i WGS84-arket
    for (const reg of selectedRegistrations) {
      const lat = parseFloat(reg.breddegrad);
      const lng = parseFloat(reg.lengdegrad);
      
      // Legg til i WGS84 sheet
      wgs84Sheet.addRow({
        artsnavn: reg.speciesInput || reg.artsNavn,
        lokalitetsnavn: reg.navnPaLokalitet,
        breddegrad: lat.toFixed(6),
        lengdegrad: lng.toFixed(6),
        noyaktighet: reg.noyaktighet ? `${reg.noyaktighet} m` : '',
        fraDato: formatDate(reg.date),
        tilDato: formatDate(reg.date),
        fraKlokke: reg.time || '',
        tilKlokke: reg.time || '',
        kategoriNorge: reg.species?.categoryNorway || reg.categoryNorway || '',
        kategoriSvalbard: reg.species?.categorySvalbard || reg.categorySvalbard || '',
        kommentar: reg.comment || ''
      });

      // Beregn UTM-sone og gruppér for UTM-ark
      const zone = getUTMZone(lng);
      const hemisphere = getHemisphere(lat);
      const zoneKey = `UTM ${zone}${hemisphere}`;

      if (!registrationsByZone[zoneKey]) {
        registrationsByZone[zoneKey] = [];
      }
      registrationsByZone[zoneKey].push({
        ...reg,
        utmCoords: convertToUTM(lat, lng, zone, hemisphere)
      });
    }

    // Opprett separate ark for hver UTM-sone
    for (const [zoneName, zoneRegistrations] of Object.entries(registrationsByZone)) {
      const utmSheet = createUTMWorksheet(workbook, zoneName);
      
      for (const reg of zoneRegistrations) {
        utmSheet.addRow({
          artsnavn: reg.speciesInput || reg.artsNavn,
          lokalitetsnavn: reg.navnPaLokalitet,
          nord: reg.utmCoords.northing,
          ost: reg.utmCoords.easting,
          noyaktighet: reg.noyaktighet ? `${reg.noyaktighet} m` : '',
          fraDato: formatDate(reg.date),
          tilDato: formatDate(reg.date),
          fraKlokke: reg.time || '',
          tilKlokke: reg.time || '',
          kategoriNorge: reg.species?.categoryNorway || reg.categoryNorway || '',
          kategoriSvalbard: reg.species?.categorySvalbard || reg.categorySvalbard || '',
          kommentar: reg.comment || ''
        });
      }
    }

    // Generer filnavn
    const firstReg = selectedRegistrations[0];
    const fileName = `${firstReg.navnPaLokalitet}_${formatDate(firstReg.date)}.xlsx`;

    // Generer og last ned filen
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Feil ved Excel-generering:', error);
    throw error;
  }
};