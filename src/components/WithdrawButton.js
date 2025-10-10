'use client';

import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { formatEther } from '../utils/formatters';

export default function WithdrawButton({ auction, userBid, onWithdrawSuccess }) {
  const { isConnected, account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canWithdraw =
    isConnected &&
    !auction.isActive &&
    userBid > 0 &&
    account &&
    auction.highestBidder.toLowerCase() !== account.toLowerCase();

  if (!canWithdraw) {
    return null;
  }

  const handleWithdraw = async () => {
    setLoading(true);
    setError('');

    try {
      await onWithdrawSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleWithdraw}
        disabled={loading}
        className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-gray-200 px-4 text-sm font-bold text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Withdrawing...
          </>
        ) : (
          `Withdraw ${formatEther(userBid, 4)} ETH`
        )}
      </button>

      {error && (
        <div className="rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
