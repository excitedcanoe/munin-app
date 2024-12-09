/**
 * TAILWIND SETUP GUIDE
 * 
 * For å sette opp Tailwind i et React-prosjekt, følg disse stegene:
 * 
 * 1. INSTALLASJON
 * Kjør følgende kommandoer i terminal:
 * ```bash
 * npm install -D tailwindcss postcss autoprefixer
 * npx tailwindcss init -p
 * ```
 * Dette oppretter:
 * - tailwind.config.js (hovedkonfigurasjon)
 * - postcss.config.js (for prosessering av CSS)
 * 
 * 2. FILSTRUKTUR
 * src/
 * ├── styles/
 *     ├── global.css       // Hovedstilark
 *     └── modules/         // Mappe for moduler
 *         └── leaflet.module.css  // Leaflet-spesifikke stiler
 * 3. REKKEFØLGE FOR IMPORT
 * - Tailwind må importeres før andre CSS-filer
 * - Eksterne bibliotek (som Leaflet) importeres etter Tailwind
 * 
 * 4. FEILSØKING
 * Hvis du ser "Unknown at rule @tailwind" eller "@apply":
 * a) Sjekk at postcss.config.js eksisterer og inneholder:
 *    module.exports = {
 *      plugins: {
 *        tailwindcss: {},
 *        autoprefixer: {},
 *      }
 *    }
 * b) Sjekk at global.css importeres i index.js eller App.js
 * c) Restart utviklingsserveren
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      zIndex: {
        'leaflet': '0',
        'controls': '400',
        'modal': '1000',
        'overlay': '999',
      },
      backgroundColor: {
        'overlay': 'rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'highlight': 'highlightFade 2s forwards',
      },
      keyframes: {
        highlightFade: {
          '0%': { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        }
      }
    },
  },
  plugins: [],
}