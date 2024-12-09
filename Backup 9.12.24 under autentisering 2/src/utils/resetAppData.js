
// mulig at denne fila skal slettes bare. se. claude "Close sidepanel on click outside + resetappdata"
export async function resetAppData() {
  // Tøm localStorage
  localStorage.clear();

  // Tøm IndexedDB
  const dbName = 'MuninAppDB'; // Erstatt med det faktiske navnet på din IndexedDB
  const request = indexedDB.deleteDatabase(dbName);

  request.onerror = (event) => {
    console.error("Feil ved sletting av database.");
  };

  request.onsuccess = (event) => {
    console.log("Database slettet vellykket");
  };

  // Tøm sessionStorage
  sessionStorage.clear();

  // Her kan du legge til mer spesifikk logikk for å tilbakestille app-tilstanden
  // For eksempel, hvis du bruker en global tilstandshåndtering som Redux eller Context

  // Oppdater UI for å reflektere tilbakestillingen
  alert("Appen har blitt tilbakestilt. Siden vil nå lastes på nytt.");
  window.location.reload();
}

export default resetAppData;