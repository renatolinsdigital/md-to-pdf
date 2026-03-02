import { useState, useCallback } from 'react';

export interface ConverterSettings {
  backgroundColor: string;
  backgroundPattern: {
    patternId: string;
    opacity: number;
    elementSize: number;
    gap: number;
    patternColor: string;
  };
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
  backgroundPattern: {
    patternId: 'none',
    opacity: 0.04,
    elementSize: 22,
    gap: 20,
    patternColor: '#000000',
  },
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
      const parsed = JSON.parse(stored);
      return {
        ...defaultSettings,
        ...parsed,
        backgroundPattern: {
          ...defaultSettings.backgroundPattern,
          ...(parsed.backgroundPattern ?? {}),
        },
        margins: { ...defaultSettings.margins, ...(parsed.margins ?? {}) },
        pageNumber: { ...defaultSettings.pageNumber, ...(parsed.pageNumber ?? {}) },
      };
    }
  } catch {
    // ignore parse errors
  }
  return defaultSettings;
}

function persistSettings(settings: ConverterSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage full or unavailable — ignore
  }
}

export function useConverterSettings() {
  const [settings, setSettings] = useState<ConverterSettings>(loadSettings);

  const updateSettings = useCallback((updates: Partial<ConverterSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      persistSettings(next);
      return next;
    });
  }, []);

  const updateMargins = useCallback((marginUpdates: Partial<ConverterSettings['margins']>) => {
    setSettings((prev) => {
      const next = { ...prev, margins: { ...prev.margins, ...marginUpdates } };
      persistSettings(next);
      return next;
    });
  }, []);

  const updatePageNumber = useCallback(
    (pageNumberUpdates: Partial<ConverterSettings['pageNumber']>) => {
      setSettings((prev) => {
        const next = { ...prev, pageNumber: { ...prev.pageNumber, ...pageNumberUpdates } };
        persistSettings(next);
        return next;
      });
    },
    [],
  );

  const updateBackgroundPattern = useCallback(
    (patternUpdates: Partial<ConverterSettings['backgroundPattern']>) => {
      setSettings((prev) => {
        const next = {
          ...prev,
          backgroundPattern: { ...prev.backgroundPattern, ...patternUpdates },
        };
        persistSettings(next);
        return next;
      });
    },
    [],
  );

  const resetSettings = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateSettings,
    updateMargins,
    updatePageNumber,
    updateBackgroundPattern,
    resetSettings,
  };
}
