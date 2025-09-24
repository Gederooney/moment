import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface TopBarState {
  currentVideoId?: string;
  title: string;
}

interface TopBarContextType {
  state: TopBarState;
  setTitle: (title: string) => void;
  setVideoState: (videoId: string, title: string) => void;
  clearVideoState: () => void;
  registerBackNavigation: (onGoBack: () => void) => () => void;
}

const TopBarContext = createContext<TopBarContextType | undefined>(undefined);

interface TopBarProviderProps {
  children: React.ReactNode;
}

export function TopBarProvider({ children }: TopBarProviderProps) {
  const [state, setState] = useState<TopBarState>({
    title: 'Moments',
  });

  const backNavigationRef = useRef<(() => void) | null>(null);

  const setTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, title }));
  }, []);

  const setVideoState = useCallback((videoId: string, title: string) => {
    setState({
      currentVideoId: videoId,
      title: title,
    });
  }, []);

  const clearVideoState = useCallback(() => {
    setState({
      currentVideoId: undefined,
      title: 'Moments',
    });
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
  };

  return (
    <TopBarContext.Provider value={contextValue}>
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBarContext() {
  const context = useContext(TopBarContext);
  if (context === undefined) {
    throw new Error('useTopBarContext must be used within a TopBarProvider');
  }
  return context;
}