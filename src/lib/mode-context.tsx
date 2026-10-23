'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ModeContextType {
  mode: 'demo' | 'bedrock';
  setMode: (mode: 'demo' | 'bedrock') => void;
  bedrockStatus: {
    configured: boolean;
    region?: string;
    modelId?: string;
    hasCredentials?: boolean;
    error?: string;
  } | null;
  refreshBedrockStatus: () => Promise<void>;
  isLoadingStatus: boolean;
}

const ModeContext = createContext<ModeContextType>({
  mode: 'demo',
  setMode: () => {},
  bedrockStatus: null,
  refreshBedrockStatus: async () => {},
  isLoadingStatus: false,
});

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<'demo' | 'bedrock'>('demo');
  const [bedrockStatus, setBedrockStatus] = useState<ModeContextType['bedrockStatus']>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  useEffect(() => {
    // Read persisted mode if available
    const saved = localStorage.getItem('lifepilot_ai_mode');
    if (saved === 'bedrock' || saved === 'demo') {
      setModeState(saved);
    }
    refreshBedrockStatus();
  }, []);

  const setMode = (newMode: 'demo' | 'bedrock') => {
    setModeState(newMode);
    localStorage.setItem('lifepilot_ai_mode', newMode);
  };

  const refreshBedrockStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const res = await fetch('/api/bedrock/status');
      const data = await res.json();
      if (data?.status) {
        setBedrockStatus(data.status);
      }
    } catch {
      setBedrockStatus({
        configured: false,
        error: 'Unable to query Bedrock status endpoint.',
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,
        bedrockStatus,
        refreshBedrockStatus,
        isLoadingStatus,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}
