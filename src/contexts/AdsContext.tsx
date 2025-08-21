import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdsContextType {
  previewMode: boolean;
  setPreviewMode: (enabled: boolean) => void;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export function AdsProvider({ children }: { children: ReactNode }) {
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <AdsContext.Provider value={{ previewMode, setPreviewMode }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
}