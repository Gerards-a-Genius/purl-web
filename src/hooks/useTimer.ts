// src/hooks/useTimer.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAddTimeSpent } from './useProjects';

interface UseTimerOptions {
  projectId: string;
  autoSaveInterval?: number; // Save to DB every N seconds (default: 60)
  onTick?: (seconds: number) => void;
}

export function useTimer({ projectId, autoSaveInterval = 60, onTick }: UseTimerOptions) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [unsavedSeconds, setUnsavedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const addTimeSpent = useAddTimeSpent(projectId);

  // Refs to hold latest values for use in callbacks
  const unsavedSecondsRef = useRef(unsavedSeconds);
  const autoSaveIntervalRef = useRef(autoSaveInterval);
  const addTimeSpentRef = useRef(addTimeSpent);

  // Keep refs in sync via effect (not during render)
  useEffect(() => {
    unsavedSecondsRef.current = unsavedSeconds;
  }, [unsavedSeconds]);

  useEffect(() => {
    autoSaveIntervalRef.current = autoSaveInterval;
  }, [autoSaveInterval]);

  useEffect(() => {
    addTimeSpentRef.current = addTimeSpent;
  }, [addTimeSpent]);

  // Start the timer
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
    }
  }, [isRunning]);

  // Pause the timer and save progress
  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      // Save unsaved seconds
      if (unsavedSecondsRef.current > 0) {
        addTimeSpentRef.current.mutate(unsavedSecondsRef.current);
        setUnsavedSeconds(0);
      }
    }
  }, [isRunning]);

  // Reset the timer
  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
    setUnsavedSeconds(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Toggle timer
  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, start, pause]);

  // Timer tick effect with auto-save
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          const newValue = prev + 1;
          onTick?.(newValue);
          return newValue;
        });
        setUnsavedSeconds(prev => {
          const newUnsaved = prev + 1;
          // Check auto-save condition
          if (newUnsaved >= autoSaveIntervalRef.current) {
            addTimeSpentRef.current.mutate(newUnsaved);
            return 0; // Reset unsaved counter
          }
          return newUnsaved;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTick]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (unsavedSecondsRef.current > 0) {
        addTimeSpentRef.current.mutate(unsavedSecondsRef.current);
      }
    };
  }, []);

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    toggle,
    formattedTime: formatTime(seconds),
  };
}

// Format seconds to HH:MM:SS or MM:SS
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format seconds to human readable
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${totalSeconds}s`;
}
