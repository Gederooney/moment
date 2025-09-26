import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface TopBarState {
  currentVideoId?: string;
  title: string;
  showBackButton: boolean;
  onBackPress: (() => void) | null;
}

interface TopBarContextType {
  state: TopBarState;
  setTitle: (title: string) => void;
  setVideoState: (videoId: string, title: string) => void;
  clearVideoState: () => void;
  registerBackNavigation: (onGoBack: () => void) => () => void;
  setBackButton: (show: boolean, onPress?: () => void) => void;
}

const TopBarContext = createContext<TopBarContextType | undefined>(undefined);

interface TopBarProviderProps {
  children: React.ReactNode;
}

export function TopBarProvider({ children }: TopBarProviderProps) {
  const [state, setState] = useState<TopBarState>({
    title: 'Moments',
    showBackButton: false,
    onBackPress: null,
  });

  const backNavigationRef = useRef<(() => void) | null>(null);

  const setTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, title }));
  }, []);

  const setBackButton = useCallback((show: boolean, onPress?: () => void) => {
    setState(prev => ({
      ...prev,
      showBackButton: show,
      onBackPress: show ? onPress || null : null,
    }));
  }, []);

  const setVideoState = useCallback((videoId: string, title: string) => {
    setState(prev => ({
      ...prev,
      currentVideoId: videoId,
      title: title,
    }));
  }, []);

  const clearVideoState = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentVideoId: undefined,
      title: 'Moments',
    }));
  }, []);

  const registerBackNavigation = useCallback((onGoBack: () => void) => {
    backNavigationRef.current = onGoBack;

    // Retourne une fonction de cleanup
    return () => {
      backNavigationRef.current = null;
    };
  }, []);

  const contextValue: TopBarContextType = {
    state,
    setTitle,
    setVideoState,
    clearVideoState,
    registerBackNavigation,
    setBackButton,
  };

  return <TopBarContext.Provider value={contextValue}>{children}</TopBarContext.Provider>;
}

export function useTopBarContext() {
  const context = useContext(TopBarContext);
  if (context === undefined) {
    throw new Error('useTopBarContext must be used within a TopBarProvider');
  }
  return context;
}
