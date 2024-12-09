/**
 * @file reportWebVitals.js
 * @description Funksjon for å rapportere Web Vitals ytelsesmålinger.
 * 
 * Denne funksjonen er en del av Create React App og brukes for å måle
 * og rapportere viktige ytelsesmetrikker for webapplikasjonen.
 * 
 * Web Vitals som måles inkluderer:
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay)
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 * 
 * @param {Function} onPerfEntry - Callback-funksjon for å håndtere ytelsesdata.
 */
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;