'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useAuctionDetail } from '../../../hooks/useAuctionDetail';
import { useWeb3 } from '../../../context/Web3Context';
import CountdownTimer from '../../../components/CountdownTimer';
import BidForm from '../../../components/BidForm';
import WithdrawButton from '../../../components/WithdrawButton';
import ClaimFundsButton from '../../../components/ClaimFundsButton';
import { formatEther, shortenAddress } from '../../../utils/formatters';

export default function AuctionDetailPage({ params }) {
  const { id } = use(params);
  const { account, updateBalance } = useWeb3();
  const {
    auction,
    userBid,
    loading,
    error,
    txLoading,
    placeBid,
    withdraw,
    getWinner,
    claimFunds,
    cancelAuction,
    refetch
  } = useAuctionDetail(id);

  const [showWinnerModal, setShowWinnerModal] = React.useState(false);
  const [winnerAddress, setWinnerAddress] = React.useState(null);
  const [checkingWinner, setCheckingWinner] = React.useState(false);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleBidSuccess = async (bidAmount) => {
    await placeBid(bidAmount);
    await updateBalance();
  };

  const handleWithdrawSuccess = async () => {
    await withdraw();
    await updateBalance();
  };

  const handleClaimFunds = async () => {
    await claimFunds();
    await updateBalance();
  };

  const handleCancelAuction = async () => {
    await cancelAuction();
  };

  const handleCheckWinner = async () => {
    setCheckingWinner(true);
    try {
      const winner = await getWinner();
      setWinnerAddress(winner);
      setShowWinnerModal(true);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to check winner');
      setShowErrorModal(true);
    } finally {
      setCheckingWinner(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !auction) {
    return (
      <main className="flex-1 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-red-50 p-8 text-center">
            <h2 className="text-xl font-bold text-red-900">Error loading auction</h2>
            <p className="mt-2 text-red-700">{error || 'Auction not found'}</p>
            <Link href="/" className="mt-4 inline-block text-[#0064D2] hover:underline">
              Return to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isCreator = account && auction.creator.toLowerCase() === account.toLowerCase();
  const isWinner = account && auction.highestBidder.toLowerCase() === account.toLowerCase();

  return (
    <main className="flex-1 bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#0064D2] hover:underline">
            Home
          </Link>
          <span>&gt;</span>
          <Link href="/" className="hover:text-[#0064D2] hover:underline">
            Auctions
          </Link>
          <span>&gt;</span>
          <span className="text-gray-700">{auction.productName}</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Image and Description */}
          <div className="flex flex-col">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg border border-gray-200">
              <div
                className="h-full w-full bg-cover bg-center bg-gradient-to-br from-purple-400 to-indigo-600"
              >
                <div className="h-full w-full flex items-center justify-center bg-black/10">
                  <div className="text-white text-8xl font-bold opacity-30">
                    {auction.productName.charAt(0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {auction.productName}
              </h1>
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-800">Description</h2>
                <p className="mt-2 text-base text-gray-600 whitespace-pre-wrap">
                  {auction.productDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Bidding Interface */}
          <div className="flex flex-col">
            {/* Bid Information Card */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="flex flex-col space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Current bid:</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {auction.highestBid > 0 ? `${formatEther(auction.highestBid)} ETH` : 'No bids yet'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Time left:</p>
                  <CountdownTimer endTime={auction.endTime} onCountdownEnd={refetch} />
                </div>

                {auction.highestBidder && auction.highestBidder !== '0x0000000000000000000000000000000000000000' && (
                  <div>
                    <p className="text-sm text-gray-500">Highest Bidder:</p>
                    <p className="font-semibold text-gray-800 truncate">
                      {shortenAddress(auction.highestBidder)}
                    </p>
                  </div>
                )}

                {userBid > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Your Bid:</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatEther(userBid)} ETH
                    </p>
                    {isWinner && auction.isActive && (
                      <p className="text-sm text-green-600 mt-1">You are currently winning!</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bidding Form */}
              {!isCreator && (
                <div className="mt-8">
                  <BidForm
                    auction={auction}
                    userBid={userBid}
                    onBidSuccess={handleBidSuccess}
                    txLoading={txLoading}
                  />
                </div>
              )}

              {/* Withdraw Button */}
              {!isCreator && (
                <div className="mt-4">
                  <WithdrawButton
                    auction={auction}
                    userBid={userBid}
                    onWithdrawSuccess={handleWithdrawSuccess}
                  />
                </div>
              )}

              {/* Creator Actions */}
              {isCreator && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Creator Actions</h3>

                  {/* Claim Funds Button */}
                  <ClaimFundsButton
                    auction={auction}
                    onClaimSuccess={handleClaimFunds}
                  />

                  {/* Cancel Auction Button */}
                  {(() => {
                    const canCancel = auction.isActive && auction.highestBid === 0n;
                    let buttonText = 'Cancel Auction';
                    let tooltipText = '';

                    if (txLoading) {
                      buttonText = 'Cancelling...';
                    } else if (!auction.isActive) {
                      buttonText = 'Cancel Auction (Ended)';
                      tooltipText = 'Auction has already ended';
                    } else if (auction.highestBid > 0n) {
                      buttonText = 'Cancel Auction (Has Bids)';
                      tooltipText = 'Cannot cancel auction with bids placed';
                    }

                    return (
                      <div className="mt-4">
                        <button
                          onClick={handleCancelAuction}
                          disabled={txLoading || !canCancel}
                          className="w-full rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={tooltipText}
                        >
                          {buttonText}
                        </button>
                        {tooltipText && !txLoading && (
                          <p className="mt-2 text-xs text-gray-500">{tooltipText}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Winner Display */}
              {!auction.isActive && auction.highestBidder && auction.highestBidder !== '0x0000000000000000000000000000000000000000' && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-sm font-semibold text-green-800">Auction Ended</p>
                    <p className="mt-1 text-sm text-green-700">
                      Winner: {shortenAddress(auction.highestBidder)}
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      Winning Bid: {formatEther(auction.highestBid)} ETH
                    </p>
                  </div>

                  {/* Check Winner Button */}
                  <button
                    onClick={handleCheckWinner}
                    disabled={checkingWinner}
                    className="mt-4 w-full rounded-full bg-[#0064D2] px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingWinner ? 'Checking...' : 'Verify Winner on Blockchain'}
                  </button>
                </div>
              )}

              {!auction.isActive && (!auction.highestBidder || auction.highestBidder === '0x0000000000000000000000000000000000000000') && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">Auction Ended</p>
                    <p className="mt-1 text-sm text-gray-600">
                      No bids were placed on this auction.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Seller Information Card */}
            <div className="mt-6 rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800">Seller information</h3>
              <div className="mt-2 flex items-center space-x-3">
                <div
                  className="aspect-square size-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600"
                >
                  <div className="h-full w-full flex items-center justify-center text-white font-bold">
                    {auction.creator.slice(2, 4).toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-[#0064D2] text-sm">
                    {shortenAddress(auction.creator)}
                  </p>
                  {isCreator && (
                    <p className="text-xs text-green-600">You created this auction</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Winner Modal */}
        {showWinnerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowWinnerModal(false)}>
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Winner Verified!</h3>
                <p className="mt-2 text-sm text-gray-500">
                  The winner has been verified directly from the blockchain smart contract.
                </p>
                <div className="mt-4 rounded-lg bg-green-50 p-4">
                  <p className="text-xs text-green-600 font-semibold">Winner Address</p>
                  <p className="mt-1 font-mono text-sm text-green-900 break-all">
                    {winnerAddress}
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    {shortenAddress(winnerAddress)}
                  </p>
                </div>
                <button
                  onClick={() => setShowWinnerModal(false)}
                  className="mt-6 w-full rounded-full bg-[#0064D2] px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowErrorModal(false)}>
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Error</h3>
                <p className="mt-2 text-sm text-gray-500">
                  There was an error processing your request.
                </p>
                <div className="mt-4 rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-red-900">
                    {errorMessage}
                  </p>
                </div>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="mt-6 w-full rounded-full bg-[#0064D2] px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
