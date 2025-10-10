'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyBids } from '../hooks/useMyBids';
import { useWeb3 } from '../context/Web3Context';
import { formatEther } from '../utils/formatters';
import { useCountdown } from '../hooks/useCountdown';
import { getAuctionContract, handleContractError } from '../utils/contracts';

function BidCard({ auction, onWithdraw }) {
  const { formattedTime, isEnded } = useCountdown(auction.endTime);
  const isOutbid = auction.isActive && !auction.isWinning;
  const isWinning = auction.isActive && auction.isWinning;
  const hasWon = !auction.isActive && auction.isWinning;
  const hasLost = !auction.isActive && !auction.isWinning;
  const canWithdraw = hasLost && auction.userBid > 0;

  const [withdrawing, setWithdrawing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [withdrawnAmount, setWithdrawnAmount] = useState(0n);
  const { signer, updateBalance } = useWeb3();

  const handleWithdraw = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!signer) {
      setErrorMessage('Please connect your wallet');
      setShowErrorModal(true);
      return;
    }

    setWithdrawing(true);
    try {
      const auctionContract = getAuctionContract(auction.address, signer);
      const tx = await auctionContract.withdraw();
      await tx.wait();

      await updateBalance();
      if (onWithdraw) {
        onWithdraw();
      }
      setWithdrawnAmount(auction.userBid);
      setShowSuccessModal(true);
    } catch (err) {
      const errMsg = handleContractError(err);
      setErrorMessage(errMsg);
      setShowErrorModal(true);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <Link href={`/auction/${auction.address}`}>
      <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#0064D2]">
              {auction.productName}
            </h3>
            <p className="mt-1 text-sm text-gray-600 line-clamp-1">
              {auction.productDescription}
            </p>
          </div>

          {isWinning && (
            <span className="ml-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
              Winning
            </span>
          )}
          {isOutbid && (
            <span className="ml-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
              Outbid!
            </span>
          )}
          {hasWon && (
            <span className="ml-2 rounded-full bg-[#86B817] px-3 py-1 text-xs font-semibold text-white">
              Won
            </span>
          )}
          {hasLost && (
            <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              Lost
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Your Bid</p>
            <p className="text-lg font-bold text-gray-900">
              {formatEther(auction.userBid)} ETH
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Current Bid</p>
            <p className="text-lg font-bold text-gray-900">
              {formatEther(auction.highestBid)} ETH
            </p>
          </div>
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className={`text-sm font-medium ${isEnded ? 'text-gray-500' : 'text-red-600'}`}>
            {isEnded ? 'Ended' : `Ends in ${formattedTime}`}
          </p>
        </div>

        {/* Withdraw Button */}
        {canWithdraw && (
          <button
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="mt-3 w-full rounded-full bg-[#86B817] px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Withdrawing...
              </>
            ) : (
              `Withdraw ${formatEther(auction.userBid)} ETH`
            )}
          </button>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { e.stopPropagation(); setShowSuccessModal(false); }}>
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Withdrawal Successful!</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Your funds have been successfully withdrawn to your wallet.
                </p>
                <div className="mt-4 rounded-lg bg-green-50 p-4">
                  <p className="text-xs text-green-600 font-semibold">Amount Withdrawn</p>
                  <p className="mt-1 text-2xl font-bold text-green-900">
                    {formatEther(withdrawnAmount)} ETH
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSuccessModal(false); }}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { e.stopPropagation(); setShowErrorModal(false); }}>
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Withdrawal Failed</h3>
                <p className="mt-2 text-sm text-gray-500">
                  There was an error processing your withdrawal.
                </p>
                <div className="mt-4 rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-red-900">
                    {errorMessage}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowErrorModal(false); }}
                  className="mt-6 w-full rounded-full bg-[#0064D2] px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function MyBids() {
  const { isConnected, account } = useWeb3();
  const { myBids, activeBids, wonBids, lostBids, loading, refetch } = useMyBids();
  const [activeTab, setActiveTab] = useState('all'); // all, active, won, lost

  if (!isConnected || !account) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">Connect your wallet to see your bids</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (myBids.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No bids yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Browse auctions and place your first bid!
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-[#0064D2] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Browse Auctions
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: 'All Bids', count: myBids.length },
    { id: 'active', label: 'Active', count: activeBids.length },
    { id: 'won', label: 'Won', count: wonBids.length },
    { id: 'lost', label: 'Lost', count: lostBids.length }
  ];

  const filteredBids =
    activeTab === 'all' ? myBids :
    activeTab === 'active' ? activeBids :
    activeTab === 'won' ? wonBids : lostBids;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 border-b-2 px-4 py-4 text-center text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'border-[#0064D2] text-[#0064D2]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`
                  ml-2 rounded-full px-2 py-0.5 text-xs
                  ${activeTab === tab.id
                    ? 'bg-[#0064D2] text-white'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredBids.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No {activeTab !== 'all' ? activeTab : ''} bids</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBids.map((bid) => (
              <BidCard key={bid.address} auction={bid} onWithdraw={refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
