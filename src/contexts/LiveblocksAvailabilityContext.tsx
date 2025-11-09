'use client';

import { createContext, useContext, ReactNode } from 'react';

interface LiveblocksContextType {
  isAvailable: boolean;
}

const LiveblocksContext = createContext<LiveblocksContextType>({ isAvailable: false });

export function LiveblocksAvailabilityProvider({ 
  children, 
  isAvailable 
}: { 
  children: ReactNode; 
  isAvailable: boolean;
}) {
  return (
    <LiveblocksContext.Provider value={{ isAvailable }}>
      {children}
    </LiveblocksContext.Provider>
  );
}

export function useIsLiveblocksAvailable() {
  return useContext(LiveblocksContext);
}
