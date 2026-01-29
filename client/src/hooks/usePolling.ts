import { useEffect, useRef } from 'react';

const POLLING_INTERVAL = parseInt(import.meta.env.VITE_POLLING_INTERVAL || '10000');

export const usePolling = (
  callback: () => Promise<void> | void,
  interval: number = POLLING_INTERVAL,
  enabled: boolean = true
) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = async () => {
      await savedCallback.current();
    };

    // Call immediately
    tick();

    // Then set up interval
    const id = setInterval(tick, interval);

    return () => clearInterval(id);
  }, [interval, enabled]);
};
