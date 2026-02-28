export interface ConverterSettings {
  backgroundColor: string;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageSize: 'A4' | 'LETTER' | 'LEGAL';
  pageNumber: {
    enabled: boolean;
    pageLabel: string;
    ofLabel: string;
    fontSize: number;
  };
  textColor: string;
}

const STORAGE_KEY = 'md-to-pdf-settings';

const defaultSettings: ConverterSettings = {
  backgroundColor: '#FFFFFF',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  pageSize: 'A4',
  pageNumber: {
    enabled: true,
    pageLabel: 'Page',
    ofLabel: 'of',
    fontSize: 10,
  },
  textColor: '#000000',
};

function loadSettings(): ConverterSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return defaultSettings;
}

import { useState, useCallback } from 'react';

export function useConverterSettings() {
  const [settings, setSettings] = useState<ConverterSettings>(loadSettings);

  const updateSettings = useCallback((updates: Partial<ConverterSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const updateMargins = useCallback((marginUpdates: Partial<ConverterSettings['margins']>) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        margins: { ...prev.margins, ...marginUpdates },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const updatePageNumber = useCallback(
    (pageNumberUpdates: Partial<ConverterSettings['pageNumber']>) => {
      setSettings((prev) => {
        const next = {
          ...prev,
          pageNumber: { ...prev.pageNumber, ...pageNumberUpdates },
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [],
  );

  return { settings, updateSettings, updateMargins, updatePageNumber };
}
