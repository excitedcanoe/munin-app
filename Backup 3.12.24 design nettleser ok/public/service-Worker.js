/**
 * @file service-Worker.js
 * @description Service Worker for artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Cacher kritiske ressurser for offline-tilgang.
 * 2. Håndterer nettverksforespørsler og serverer cachelagrede ressurser når offline.
 * 3. Oppdaterer cachen med nye versjoner av ressurser.
 * 4. Rydder opp i gamle cacher ved aktivering av ny service worker.
 * 
 * Viktig for videre utvikling:
 * - Implementere mer sofistikerte caching-strategier for ulike typer ressurser.
 * - Legge til funksjonalitet for å håndtere bakgrunnssynkronisering av data.
 * - Implementere push-varsler for viktige oppdateringer eller hendelser.
 * - Optimalisere ytelsen ved å finjustere caching-logikken.
 */

/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'artregistrering-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Installer service worker og cache ressurser
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Aktiver service worker og fjern gamle cacher
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return undefined;
        })
      );
    })
  );
});

// Håndter fetch-forespørsler
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Returner cachet respons hvis tilgjengelig
        if (cachedResponse) {
          // Oppdater cachen i bakgrunnen
          fetch(event.request).then(response => {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response);
            });
          });
          return cachedResponse;
        }

        // Hvis ikke i cache, hent fra nettverket
        return fetch(event.request).then(response => {
          // Cache den hentede responsen
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
          return response;
        });
      })
  );
});

// Funksjon for å registrere service worker
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js');
    });
  }
}