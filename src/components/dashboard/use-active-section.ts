'use client';

import { useState, useEffect, useCallback } from 'react';
import { navItems, STORAGE_KEY } from './nav-items';

export function useActiveSection() {
  const [activeSection, setActiveSectionInternal] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash && navItems.some(n => n.id === hash)) {
        return hash;
      }
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && navItems.some(n => n.id === stored)) {
          return stored;
        }
      } catch {}
    }
    return 'overview';
  });

  const setActiveSection = useCallback((section: string) => {
    setActiveSectionInternal(section);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && navItems.some(n => n.id === hash)) {
        setActiveSectionInternal(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    window.location.hash = activeSection;
    try {
      localStorage.setItem(STORAGE_KEY, activeSection);
    } catch {}
  }, [activeSection]);

  return { activeSection, setActiveSection };
}
