'use client';

import { useState, useCallback, Dispatch, SetStateAction } from 'react';

export type ViewMode = 'card' | 'table';

export interface UseViewModeReturn {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  handleViewModeChange: (_value: string) => void;
}

export function useViewMode(initial: ViewMode = 'card'): UseViewModeReturn {
  const [viewMode, setViewMode] = useState<ViewMode>(initial);
  const handleViewModeChange = useCallback((value: string) => {
    setViewMode(value as ViewMode);
  }, []);
  return { viewMode, setViewMode, handleViewModeChange };
}
