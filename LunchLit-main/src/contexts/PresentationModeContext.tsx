import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PresentationModeContextType {
  isPresentationMode: boolean;
  togglePresentationMode: () => void;
  canAccessPresentationMode: boolean;
}

const PresentationModeContext = createContext<PresentationModeContextType | undefined>(undefined);

export function PresentationModeProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = usePermissions();
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (isAdmin) {
      const stored = localStorage.getItem('presentationMode');
      if (stored === 'true') {
        setIsPresentationMode(true);
      }
    }
  }, [isAdmin]);

  // Clear presentation mode if user is not admin
  useEffect(() => {
    if (!isAdmin && isPresentationMode) {
      setIsPresentationMode(false);
      localStorage.removeItem('presentationMode');
    }
  }, [isAdmin, isPresentationMode]);

  const togglePresentationMode = () => {
    const newValue = !isPresentationMode;
    setIsPresentationMode(newValue);
    if (newValue) {
      localStorage.setItem('presentationMode', 'true');
    } else {
      localStorage.removeItem('presentationMode');
    }
  };

  return (
    <PresentationModeContext.Provider
      value={{
        isPresentationMode,
        togglePresentationMode,
        canAccessPresentationMode: isAdmin,
      }}
    >
      {children}
    </PresentationModeContext.Provider>
  );
}

export function usePresentationMode() {
  const context = useContext(PresentationModeContext);
  if (context === undefined) {
    throw new Error('usePresentationMode must be used within a PresentationModeProvider');
  }
  return context;
}
