import { useState, useEffect } from 'react';
import TodoService from '../services/todoService';

/**
 * Custom hook to fetch and poll server time
 * Updates current time every 60 seconds
 * @returns {Object} { currentTime: Date, error: Error|null }
 */
export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const serverTime = await TodoService.getServerTime();
        setCurrentTime(serverTime);
        setError(null);
      } catch (err) {
        console.error('Error fetching server time:', err);
        setError(err);
        setCurrentTime(new Date()); // Fallback to client time
      }
    };

    // Initial fetch
    fetchTime();

    // Poll every 60 seconds
    const interval = setInterval(fetchTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return { currentTime, error };
}
