/**
 * @file useDevice.js
 * @description Custom hook for device detection og responsive design.
 * Gir konsistent device-håndtering på tvers av applikasjonen.
 * 
 * Breakpoints:
 * - Phone: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: > 1024px
 * 
 * 
 * isPhone er true bare for mobiltelefoner (enheter under 768px)
isMobile er true for både telefoner OG tablets (alt under 1024px). Dette beregnes med isPhone || isTablet
 */

/**
 * @file useDevice.js
 * @description Custom hook for device detection og responsive design.
 * Gir konsistent device-håndtering på tvers av applikasjonen.
 */

import { useState, useEffect, useMemo } from 'react';

export const BREAKPOINTS = {
  PHONE: 768,
  TABLET: 1024,
  DESKTOP: 1280
};

export const useDevice = () => {
  const [deviceType, setDeviceType] = useState('desktop');
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      if (width <= BREAKPOINTS.PHONE) {
        setDeviceType('phone');
      } else if (width <= BREAKPOINTS.TABLET) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPhone = useMemo(() => deviceType === 'phone', [deviceType]);
  const isTablet = useMemo(() => deviceType === 'tablet', [deviceType]);
  const isDesktop = useMemo(() => deviceType === 'desktop', [deviceType]);
  const isMobile = useMemo(() => isPhone || isTablet, [isPhone, isTablet]);

  const isBreakpoint = useMemo(() => ({
    above: (breakpoint) => windowWidth > breakpoint,
    below: (breakpoint) => windowWidth < breakpoint,
    between: (min, max) => windowWidth >= min && windowWidth <= max
  }), [windowWidth]);

  return {
    deviceType,
    isPhone,
    isTablet,
    isDesktop,
    isMobile,
    windowWidth,
    isBreakpoint,
    breakpoints: BREAKPOINTS
  };
};

export default useDevice;