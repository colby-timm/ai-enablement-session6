import { renderHook, waitFor } from '@testing-library/react';
import { useCurrentTime } from '../useCurrentTime';
import TodoService from '../../services/todoService';

jest.mock('../../services/todoService');

describe('useCurrentTime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fetch server time on mount', async () => {
    const mockDate = new Date('2025-11-13T18:30:00.000Z');
    TodoService.getServerTime.mockResolvedValue(mockDate);

    const { result } = renderHook(() => useCurrentTime());

    await waitFor(() => {
      expect(result.current.currentTime).toEqual(mockDate);
    });

    expect(TodoService.getServerTime).toHaveBeenCalledTimes(1);
  });

  it('should poll server time every 60 seconds', async () => {
    const mockDate = new Date('2025-11-13T18:30:00.000Z');
    TodoService.getServerTime.mockResolvedValue(mockDate);

    renderHook(() => useCurrentTime());

    await waitFor(() => {
      expect(TodoService.getServerTime).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(TodoService.getServerTime).toHaveBeenCalledTimes(2);
    });

    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(TodoService.getServerTime).toHaveBeenCalledTimes(3);
    });
  });

  it('should cleanup interval on unmount', async () => {
    const mockDate = new Date('2025-11-13T18:30:00.000Z');
    TodoService.getServerTime.mockResolvedValue(mockDate);

    const { unmount } = renderHook(() => useCurrentTime());

    await waitFor(() => {
      expect(TodoService.getServerTime).toHaveBeenCalledTimes(1);
    });

    unmount();

    jest.advanceTimersByTime(60000);

    expect(TodoService.getServerTime).toHaveBeenCalledTimes(1);
  });

  it('should fallback to client time on error', async () => {
    TodoService.getServerTime.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCurrentTime());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.currentTime).toBeInstanceOf(Date);
    });
  });
});
