import { useState, useCallback, useEffect } from 'react';
import { readStorage, writeStorage } from '@shared/helpers/storage';

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
  historySize: number;
}

const STORAGE_KEY = 'md-to-pdf-settings';

export const DEFAULT_SETTINGS: ConverterSettings = {
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
  historySize: 50,
};

function loadSettings(): ConverterSettings {
  const stored = readStorage(STORAGE_KEY);
  if (!stored) return DEFAULT_SETTINGS;

  try {
    const saved = JSON.parse(stored) as Partial<ConverterSettings>;
    // Merge nested groups too, so settings saved by an older version gain any newer fields
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      backgroundPattern: { ...DEFAULT_SETTINGS.backgroundPattern, ...saved.backgroundPattern },
      margins: { ...DEFAULT_SETTINGS.margins, ...saved.margins },
      pageNumber: { ...DEFAULT_SETTINGS.pageNumber, ...saved.pageNumber },
    };
  } catch {
    return DEFAULT_SETTINGS; // Corrupted JSON
  }
}

export function useConverterSettings() {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    writeStorage(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<ConverterSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateMargins = useCallback((updates: Partial<ConverterSettings['margins']>) => {
    setSettings((prev) => ({ ...prev, margins: { ...prev.margins, ...updates } }));
  }, []);

  const updatePageNumber = useCallback((updates: Partial<ConverterSettings['pageNumber']>) => {
    setSettings((prev) => ({ ...prev, pageNumber: { ...prev.pageNumber, ...updates } }));
  }, []);

  const updateBackgroundPattern = useCallback(
    (updates: Partial<ConverterSettings['backgroundPattern']>) => {
      setSettings((prev) => ({
        ...prev,
        backgroundPattern: { ...prev.backgroundPattern, ...updates },
      }));
    },
    [],
  );

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  return {
    settings,
    updateSettings,
    updateMargins,
    updatePageNumber,
    updateBackgroundPattern,
    resetSettings,
  };
}
