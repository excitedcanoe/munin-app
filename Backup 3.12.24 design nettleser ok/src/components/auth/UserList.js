/**
 * @file UserList.js
 * @description Komponent for å vise en liste over registrerte brukere i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Henter en liste over alle registrerte brukere fra backend.
 * 2. Viser brukerlisten i et oversiktlig format.
 * 3. Oppdaterer listen automatisk ved endringer i brukerdata.
 * 
 * Komponentstruktur:
 * - Overskrift: Viser tittelen "Registrerte brukere".
 * - Brukerliste: Viser en liste over alle registrerte brukere.
 * 
 * Viktig for fremtidig utvikling og implementering:
 * - Implementere paginering for å håndtere lange brukerlister effektivt.
 * - Legge til søke- og filtreringsfunksjonalitet for å finne spesifikke brukere.
 * - Implementere sortering av brukerlisten basert på ulike kriterier (f.eks. brukernavn, registreringsdato).
 * - Legge til mer detaljert brukerinformasjon og mulighet for å vise/redigere brukerprofiler.
 * - Implementere autorisasjonskontroll for å sikre at kun administratorer har tilgang til denne komponenten.
 * - Legge til funksjonalitet for å administrere brukere (f.eks. deaktivere kontoer, endre brukerroller).
 * - Implementere real-time oppdateringer av brukerlisten ved endringer i brukerdata.
 */

import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/auth';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Feil ved henting av brukerliste:', error);
        // TODO: Implementer brukervennlig feilhåndtering
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="user-list">
      <h2>Registrerte brukere</h2>
      {users.length > 0 ? (
        <ul>
          {users.map(user => (
            <li key={user.username}>{user.username}</li>
          ))}
        </ul>
      ) : (
        <p>Ingen brukere funnet.</p>
      )}
    </div>
  );
};

export default UserList;