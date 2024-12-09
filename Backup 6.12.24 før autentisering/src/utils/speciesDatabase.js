/**
 * @file speciesDatabase.js
 * @description Modul for håndtering av artsdatabase i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Initialiserer og oppgraderer IndexedDB for artsdata.
 * 2. Sjekker og oppdaterer artsdatabasen ved behov.
 * 3. Laster inn artsdata fra eksterne JSON-filer.
 * 4. Tilbyr søkefunksjonalitet i artsdatabasen.
 * 5. Håndterer versjonskontroll for artsdataene.
 * 
 * Viktig for videre utvikling:
 * - Optimalisere søkefunksjonaliteten for bedre ytelse ved store datasett.
 * - Implementere mer avanserte søkefiltre og sorteringsalternativer.
 * - Vurdere å implementere en caching-mekanisme for hyppig søkte arter.
 * - Legge til funksjonalitet for å håndtere brukerbaserte artsregistreringer.
 */

import { openDB } from 'idb';
import Fuse from 'fuse.js';

const DB_NAME = 'SpeciesDB';
const STORE_NAME = 'species';
const DB_VERSION = 5;
const DATA_VERSION_KEY = 'dataVersion';
const CURRENT_DATA_VERSION = '2023-09-28';

/**
 * Initialiserer IndexedDB for artsdatabasen.
 * @returns {Promise<IDBDatabase>} En Promise som resolver til databaseobjektet.
 */
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('scientificName', 'scientificName', { unique: false });
        store.createIndex('commonNameNorwegian', 'commonNameNorwegian', { unique: false });
        console.log('Created indexes for species store');
      }
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata');
      }
    },
  });
}

/**
 * Sjekker og oppdaterer artsdatabasen ved behov.
 * @param {Function} progressCallback - Funksjon for å rapportere fremgang.
 */
export async function checkAndUpdateData(progressCallback) {
  const db = await initDB();
  const tx = db.transaction('metadata', 'readonly');
  const metadataStore = tx.objectStore('metadata');
  const storedVersion = await metadataStore.get(DATA_VERSION_KEY);

  console.log('Stored data version:', storedVersion);
  console.log('Current data version:', CURRENT_DATA_VERSION);

  if (storedVersion !== CURRENT_DATA_VERSION) {
    console.log('Data version mismatch. Updating species data...');
    await updateSpeciesData(progressCallback);
    const updateTx = db.transaction('metadata', 'readwrite');
    const updateMetadataStore = updateTx.objectStore('metadata');
    await updateMetadataStore.put(CURRENT_DATA_VERSION, DATA_VERSION_KEY);
    console.log('Species data updated to version:', CURRENT_DATA_VERSION);
  } else {
    console.log('Species data is up to date.');
    if (progressCallback) progressCallback(100);
  }
  
  console.log('Total species in database after check/update:', await getSpeciesCount());
  await checkDatabaseContent();
}

/**
 * Sjekker innholdet i databasen og logger eksempler.
 * Denne funksjonen er nyttig for debugging og verifisering av databaseinnhold.
 */
export async function checkDatabaseContent() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const allSpecies = await store.getAll();
  console.log('Total species in database:', allSpecies.length);
  console.log('Sample species:', allSpecies.slice(0, 5));
  
  console.log('Sample species with Norwegian names:', 
    allSpecies.filter(s => s.commonNameNorwegian).slice(0, 10).map(s => ({
      commonNameNorwegian: s.commonNameNorwegian,
      scientificName: s.scientificName
    }))
  );
}

/**
 * Henter gjeldende dataversjon fra metadata-lageret.
 * @returns {Promise<string>} Gjeldende dataversjon.
 */
export async function getCurrentDataVersion() {
  const db = await initDB();
  const tx = db.transaction('metadata', 'readonly');
  const metadataStore = tx.objectStore('metadata');
  return metadataStore.get(DATA_VERSION_KEY);
}

/**
 * Oppdaterer artsdataene i databasen.
 * Denne funksjonen laster inn data fra eksterne JSON-filer og lagrer dem i IndexedDB.
 * @param {Function} progressCallback - Funksjon for å rapportere fremgang under oppdateringen.
 */
async function updateSpeciesData(progressCallback) {
  const db = await initDB();
  let totalSpecies = 0;
  let processedFiles = 0;

  for (let i = 1; i <= 10; i++) {
    try {
      console.log(`Fetching data from species-data-${i}.json`);
      const response = await fetch(`${process.env.PUBLIC_URL}/data/species-data-${i}.json`);
      const data = await response.json();
      
      if (Array.isArray(data["original csv"]) && data["original csv"].length > 0) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        for (const species of data["original csv"]) {
          if (!species.Genus || !species.Species) {
            console.warn('Invalid species data:', species);
            continue;
          }
          
          const id = `${species.Genus}_${species.Species}`;
          const speciesData = {
            id: id,
            commonNameNorwegian: species.VernacularNameBokmaal || '',
            scientificName: `${species.Genus} ${species.Species}`,
            categoryNorway: species.CategoryNorway || '', // Legg til ny kategori
            categorySvalbard: species.CategorySvalbard || '', // Legg til ny kategori
            ...species
          };
          
          await store.put(speciesData);
        }
      }
    } catch (error) {
      console.error(`Error processing species-data-${i}.json:`, error);
    }
  }

  console.log(`Processed ${totalSpecies} species from ${processedFiles} files`);
}

/**
 * Søker etter arter basert på en gitt spørring.
 * Denne funksjonen utfører et detaljert søk i artsdatabasen, inkludert eksakte treff,
 * delvise treff og fuzzy-søk.
 * @param {string} query - Søkestrengen.
 * @returns {Promise<Array>} Liste over matchende arter, begrenset til 20 resultater.
 */
export async function searchSpecies(query) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  const allSpecies = await store.getAll();

  const normalizedQuery = query.toLowerCase().trim();
  
  console.log('Normalized query:', normalizedQuery);

  // Eksakte treff
  const exactMatches = allSpecies.filter(species => 
    (species.commonNameNorwegian && species.commonNameNorwegian.toLowerCase() === normalizedQuery) ||
    species.scientificName.toLowerCase() === normalizedQuery
  );

  // Delvise treff
  const partialMatches = allSpecies.filter(species =>
    !exactMatches.includes(species) && (
      (species.commonNameNorwegian && species.commonNameNorwegian.toLowerCase().includes(normalizedQuery)) ||
      species.scientificName.toLowerCase().includes(normalizedQuery)
    )
  );

  // Fuzzy-søk
  const fuse = new Fuse(allSpecies, {
    keys: ['commonNameNorwegian', 'scientificName'],
    threshold: 0.3,
    includeScore: true
  });
  const fuzzyResults = fuse.search(normalizedQuery)
    .filter(result => !exactMatches.includes(result.item) && !partialMatches.includes(result.item))
    .map(result => result.item);

  console.log('Exact matches:', exactMatches.map(s => ({
    commonNameNorwegian: s.commonNameNorwegian,
    scientificName: s.scientificName
  })));
  console.log('Partial matches:', partialMatches.map(s => ({
    commonNameNorwegian: s.commonNameNorwegian,
    scientificName: s.scientificName
  })));
  console.log('Fuzzy matches:', fuzzyResults.map(s => ({
    commonNameNorwegian: s.commonNameNorwegian,
    scientificName: s.scientificName
  })));

  const combinedResults = [...exactMatches, ...partialMatches, ...fuzzyResults];
  console.log('Search results before return:', combinedResults);
  return combinedResults.slice(0, 20);
}

/**
 * Henter totalt antall arter i databasen.
 * @returns {Promise<number>} Antall arter.
 */
export async function getSpeciesCount() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const count = await store.count();
  console.log(`Total species in database: ${count}`);
  return count;
}