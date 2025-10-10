'use client';

import { useState } from 'react';
import { parseEther, formatEther } from '../utils/formatters';
import { useWeb3 } from '../context/Web3Context';

export default function BidForm({ auction, userBid, onBidSuccess, txLoading }) {
  const { isConnected, account } = useWeb3();
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    const bidWei = parseEther(bidAmount);
    const minBid = auction.highestBid > 0 ? auction.highestBid : 0n;

    if (bidWei <= minBid) {
      setError(`Bid must be higher than ${formatEther(minBid)} ETH`);
      return;
    }

    if (userBid > 0) {
      setError('You have already placed a bid on this auction');
      return;
    }

    try {
      await onBidSuccess(bidWei);
      setBidAmount('');
    } catch (err) {
      setError(err.message);
    }
  };

  const isAuctionEnded = !auction.isActive;
  const hasUserBid = userBid > 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="number"
          step="0.001"
          min="0"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          disabled={!isConnected || isAuctionEnded || hasUserBid || txLoading}
          className="form-input h-14 w-full rounded-md border-gray-300 px-4 py-2 text-lg text-gray-900 placeholder-gray-400 focus:border-[#0064D2] focus:ring-[#0064D2] disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={isAuctionEnded ? 'Auction ended' : hasUserBid ? 'Already bid' : '0.00'}
        />
        <span className="absolute inset-y-0 right-4 flex items-center text-gray-500">
          ETH
        </span>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isConnected || isAuctionEnded || hasUserBid || txLoading || !bidAmount}
        className="flex h-14 w-full cursor-pointer items-center justify-center rounded-full bg-[#0064D2] px-6 text-lg font-bold text-white shadow-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {txLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          'Place Bid'
        )}
      </button>

      {!isConnected && (
        <p className="text-center text-sm text-gray-500">
          Connect your wallet to place a bid
        </p>
      )}
    </div>
  );
}
