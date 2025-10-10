'use client';

import { useState, useEffect } from 'react';
import { formatTimeRemaining, formatCountdown } from '../utils/formatters';

/**
 * Hook to manage countdown timer
 * @param {number} endTime - Unix timestamp when countdown ends
 * @param {function} onCountdownEnd - Optional callback when countdown reaches 0
 */
export function useCountdown(endTime, onCountdownEnd) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsEnded(true);

        // Trigger callback once when countdown reaches 0
        if (!hasTriggered && onCountdownEnd) {
          setHasTriggered(true);
          onCountdownEnd();
        }
      } else {
        setTimeRemaining(remaining);
        setIsEnded(false);
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [endTime, onCountdownEnd, hasTriggered]);

  return {
    timeRemaining,
    isEnded,
    formattedTime: formatTimeRemaining(timeRemaining),
    formattedCountdown: formatCountdown(timeRemaining)
  };
}
