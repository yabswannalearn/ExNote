import { useCallback, useEffect, useRef, useState } from 'react';

// Plain JS between-set countdown. No native deps: just setInterval ticking
// once a second. Visual only — no background notification or sound.
export function useRestTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds: number) => {
      clear();
      if (seconds <= 0) {
        setIsRunning(false);
        setSecondsLeft(0);
        return;
      }
      setSecondsLeft(seconds);
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clear();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clear]
  );

  const skip = useCallback(() => {
    clear();
    setIsRunning(false);
    setSecondsLeft(0);
  }, [clear]);

  const addTime = useCallback((seconds: number) => {
    setSecondsLeft((prev) => prev + seconds);
  }, []);

  // Stop ticking if the screen unmounts mid-rest.
  useEffect(() => clear, [clear]);

  return { secondsLeft, isRunning, start, skip, addTime };
}
