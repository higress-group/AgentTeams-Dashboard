import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useViewMode } from '@/lib/use-view-mode';

describe('useViewMode', () => {
  it('defaults to card view', () => {
    const { result } = renderHook(() => useViewMode());
    expect(result.current.viewMode).toBe('card');
  });

  it('honors provided initial value', () => {
    const { result } = renderHook(() => useViewMode('table'));
    expect(result.current.viewMode).toBe('table');
  });

  it('updates viewMode through handleViewModeChange', () => {
    const { result } = renderHook(() => useViewMode('card'));
    act(() => result.current.handleViewModeChange('table'));
    expect(result.current.viewMode).toBe('table');
    act(() => result.current.handleViewModeChange('card'));
    expect(result.current.viewMode).toBe('card');
  });

  it('returns a stable setViewMode setter', () => {
    const { result, rerender } = renderHook(() => useViewMode('card'));
    const setter = result.current.setViewMode;
    rerender();
    expect(result.current.setViewMode).toBe(setter);
  });
});
