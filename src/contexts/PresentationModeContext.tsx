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
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (canAccess) {
      const stored = localStorage.getItem('presentationMode');
      if (stored === 'true') {
        setIsPresentationMode(true);
      }
    }
  }, [canAccess]);

  // Clear presentation mode only after auth/permissions load if user is not admin/owner
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
