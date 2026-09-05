import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { isOwnerEmail } from '@/lib/secrets';

interface PresentationModeContextType {
  isPresentationMode: boolean;
  togglePresentationMode: () => void;
  canAccessPresentationMode: boolean;
}

const PresentationModeContext = createContext<PresentationModeContextType | undefined>(undefined);

export function PresentationModeProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: permissionsLoading } = usePermissions();
  const isOwner = isOwnerEmail(user?.email);
  const canAccess = isOwner || isAdmin;
  // Initialize from localStorage immediately so test mode persists across refreshes
  const [isPresentationMode, setIsPresentationMode] = useState(() => {
    return localStorage.getItem('presentationMode') === 'true';
  });

  // Re-check localStorage whenever access is granted (e.g. after auth loads)
  useEffect(() => {
    if (canAccess) {
      const stored = localStorage.getItem('presentationMode');
      if (stored === 'true') {
        setIsPresentationMode(true);
      }
    }
  }, [canAccess]);

  // Clear presentation mode only after auth/permissions are fully loaded and user truly lacks access
  useEffect(() => {
    if (!authLoading && !permissionsLoading && !canAccess && isPresentationMode) {
      setIsPresentationMode(false);
      localStorage.removeItem('presentationMode');
    }
  }, [canAccess, isPresentationMode, authLoading, permissionsLoading]);

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
        canAccessPresentationMode: canAccess,
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
