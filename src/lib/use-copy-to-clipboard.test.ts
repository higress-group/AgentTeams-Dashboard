import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from '@/lib/use-copy-to-clipboard';

describe('useCopyToClipboard', () => {
  const writeText = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, { clipboard: { writeText } });
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns copied=false initially', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.copied).toBe(false);
  });

  it('sets copied to true after successful write', async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => {
      const ok = await result.current.copy('hello');
      expect(ok).toBe(true);
    });
    expect(result.current.copied).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('resets copied after the configured reset interval', async () => {
    const { result } = renderHook(() => useCopyToClipboard({ resetMs: 1000 }));
    await act(async () => {
      await result.current.copy('hello');
    });
    expect(result.current.copied).toBe(true);
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(false);
  });

  it('returns false when clipboard write fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => {
      const ok = await result.current.copy('hello');
      expect(ok).toBe(false);
    });
    expect(result.current.copied).toBe(false);
  });

  it('invokes onCopy callback on success', async () => {
    const onCopy = vi.fn();
    const { result } = renderHook(() => useCopyToClipboard({ onCopy }));
    await act(async () => {
      await result.current.copy('payload');
    });
    expect(onCopy).toHaveBeenCalledWith('payload');
  });

  it('clears pending timeout on unmount', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { result, unmount } = renderHook(() => useCopyToClipboard());
    await act(async () => {
      await result.current.copy('hello');
    });
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
