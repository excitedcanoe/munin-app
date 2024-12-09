/**
 * @file auth.js
 * @description Modul for håndtering av brukerautentisering i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Initialiserer og oppgraderer IndexedDB for brukerdata.
 * 2. Håndterer brukerregistrering med passordhashing.
 * 3. Autentiserer brukere ved innlogging.
 * 4. Tillater tilbakestilling av passord.
 * 5. Henter alle registrerte brukere.
 * 
 * Viktig for videre utvikling:
 * - Implementere mer robuste sikkerhetsmekanismer, som tokenhåndtering.
 * - Legge til funksjonalitet for å håndtere brukerroller og tillatelser.
 * - Vurdere å implementere to-faktor autentisering for økt sikkerhet.
 * - Legge til logging av innloggingsforsøk for sikkerhetsovervåking.
 */

import { openDB } from 'idb';
import bcrypt from 'bcryptjs';

// Initialiserer IndexedDB
const dbPromise = openDB('UserAuth', 2, {
  upgrade(db, oldVersion, newVersion, transaction) {
    if (oldVersion < 1) {
      db.createObjectStore('users', { keyPath: 'username' });
    }
  },
});

/**
 * Registrerer en ny bruker i systemet.
 * @param {string} username - Brukerens e-postadresse.
 * @param {string} password - Brukerens passord.
 * @param {string} firstName - Brukerens fornavn.
 * @param {string} lastName - Brukerens etternavn.
 */
export async function registerUser(username, password, firstName, lastName = false) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const db = await dbPromise;
  await db.put('users', { username, password: hashedPassword, firstName, lastName });
}

/**
 * Autentiserer en bruker ved innlogging.
 * @param {string} username - Brukerens e-postadresse.
 * @param {string} password - Brukerens passord.
 * @returns {Object} Brukerdata ved vellykket innlogging.
 * @throws {Error} Hvis autentisering mislykkes.
 */
export async function loginUser(username, password) {
  const db = await dbPromise;
  const user = await db.get('users', username);
  if (!user) {
    throw new Error('Bruker ikke funnet');
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Ugyldig passord');
  }
  return { username: user.username, firstName: user.firstName, lastName: user.lastName};
}

/**
 * Tilbakestiller passordet for en gitt bruker.
 * @param {string} username - Brukerens e-postadresse.
 * @param {string} newPassword - Det nye passordet.
 * @throws {Error} Hvis brukeren ikke finnes.
 */
export async function resetPassword(username, newPassword) {
  const db = await dbPromise;
  const user = await db.get('users', username);
  if (!user) {
    throw new Error('User not found');
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.put('users', { ...user, password: hashedPassword });
}

/**
 * Henter alle registrerte brukere.
 * @returns {Array} Liste over alle brukere.
 */
export async function getAllUsers() {
  const db = await dbPromise;
  return db.getAll('users');
}

