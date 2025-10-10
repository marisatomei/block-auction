'use client';

import { useState } from 'react';

/**
 * Button for auction creators to claim winning bid funds
 * @param {Object} props
 * @param {Object} props.auction - Auction details
 * @param {Function} props.onClaimSuccess - Callback after successful claim
 */
export default function ClaimFundsButton({ auction, onClaimSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClaim = async () => {
    setLoading(true);
    setError(null);

    try {
      await onClaimSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check conditions
  const auctionStillActive = auction.isActive;
  const noWinner = !auction.highestBidder || auction.highestBidder === '0x0000000000000000000000000000000000000000';
  const alreadyClaimed = auction.claimed;
  const canClaim = !auctionStillActive && !noWinner && !alreadyClaimed;

  // Determine button text and tooltip
  let buttonText = 'Claim Winning Bid Funds';
  let tooltipText = '';

  if (loading) {
    buttonText = 'Claiming funds...';
  } else if (alreadyClaimed) {
    buttonText = 'Claim Funds (Already Claimed)';
    tooltipText = 'Funds have already been claimed for this auction';
  } else if (auctionStillActive) {
    buttonText = 'Claim Funds (Auction Still Active)';
    tooltipText = 'Wait for the auction to end before claiming funds';
  } else if (noWinner) {
    buttonText = 'Claim Funds (No Winner)';
    tooltipText = 'No bids were placed on this auction';
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleClaim}
        disabled={loading || !canClaim}
        className="w-full rounded-full bg-[#86B817] px-6 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title={tooltipText}
      >
        {buttonText}
      </button>

      {tooltipText && !loading && (
        <p className="mt-2 text-xs text-gray-500">{tooltipText}</p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
