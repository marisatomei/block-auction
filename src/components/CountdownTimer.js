'use client';

import { useCountdown } from '../hooks/useCountdown';

export default function CountdownTimer({ endTime, className = '', onCountdownEnd }) {
  const { formattedCountdown, isEnded } = useCountdown(endTime, onCountdownEnd);

  if (isEnded) {
    return (
      <p className={`text-2xl font-bold text-gray-500 ${className}`}>
        Auction Ended
      </p>
    );
  }

  return (
    <p className={`text-2xl font-bold text-[#E53238] ${className}`}>
      {formattedCountdown}
    </p>
  );
}
