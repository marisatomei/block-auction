'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getAuctionContract } from '../utils/contracts';

/**
 * Hook to fetch auctions where the user has placed bids
 */
export function useMyBids() {
  const { factoryContract, provider, account } = useWeb3();
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all auctions and filter for user's bids
   */
  const fetchMyBids = useCallback(async () => {
    if (!factoryContract || !provider || !account) {
      setMyBids([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get all auction addresses
      const auctionAddresses = await factoryContract.getAllAuctions();

      // Fetch details for each auction and check if user has bid
      const bidsPromises = auctionAddresses.map(async (address) => {
        const auctionContract = getAuctionContract(address, provider);

        // Get user's bid amount
        const userBidAmount = await auctionContract.bids(account);

        // Only include auctions where user has placed a bid
        if (userBidAmount > 0n) {
          const details = await auctionContract.getAuctionDetails();

          return {
            address,
            productName: details[0],
            productDescription: details[1],
            creator: details[2],
            endTime: Number(details[3]),
            highestBidder: details[4],
            highestBid: details[5],
            isActive: details[6], // Use contract's calculation
            userBid: userBidAmount,
            isWinning: details[4].toLowerCase() === account.toLowerCase()
          };
        }

        return null;
      });

      const bidsData = (await Promise.all(bidsPromises)).filter(bid => bid !== null);

      // Sort: active winning bids first, then active losing, then ended won, then ended lost
      bidsData.sort((a, b) => {
        // Active auctions first
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;

        // Within active, winning first
        if (a.isActive && b.isActive) {
          if (a.isWinning && !b.isWinning) return -1;
          if (!a.isWinning && b.isWinning) return 1;
        }

        // Within ended, won first
        if (!a.isActive && !b.isActive) {
          if (a.isWinning && !b.isWinning) return -1;
          if (!a.isWinning && b.isWinning) return 1;
        }

        // By end time (most recent first)
        return b.endTime - a.endTime;
      });

      setMyBids(bidsData);
    } catch (err) {
      console.error('Error fetching my bids:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [factoryContract, provider, account]);

  // Fetch my bids on mount and when dependencies change
  useEffect(() => {
    fetchMyBids();
  }, [fetchMyBids]);

  // Listen for new auctions
  useEffect(() => {
    if (!factoryContract || !provider || !account) return;

    const handleAuctionCreated = () => {
      fetchMyBids();
    };

    factoryContract.on('AuctionCreated', handleAuctionCreated);

    return () => {
      factoryContract.off('AuctionCreated', handleAuctionCreated);
    };
  }, [factoryContract, provider, account, fetchMyBids]);

  // Listen for new bids on auctions where user has bid
  useEffect(() => {
    if (!provider || !account || myBids.length === 0) return;

    const listeners = [];

    myBids.forEach((bid) => {
      const auctionContract = getAuctionContract(bid.address, provider);

      const handleNewBid = (bidder, amount, timestamp) => {
        // Refresh immediately when any bid is placed on auctions where user has bid
        fetchMyBids();
      };

      auctionContract.on('NewBid', handleNewBid);
      listeners.push({ contract: auctionContract, handler: handleNewBid });
    });

    return () => {
      listeners.forEach(({ contract, handler }) => {
        contract.off('NewBid', handler);
      });
    };
  }, [provider, account, myBids.length, fetchMyBids]);

  // Helper functions to filter bids
  const activeBids = myBids.filter(bid => bid.isActive);
  const wonBids = myBids.filter(bid => !bid.isActive && bid.isWinning);
  const lostBids = myBids.filter(bid => !bid.isActive && !bid.isWinning);
  const winningBids = myBids.filter(bid => bid.isActive && bid.isWinning);
  const losingBids = myBids.filter(bid => bid.isActive && !bid.isWinning);

  return {
    myBids,
    activeBids,
    wonBids,
    lostBids,
    winningBids,
    losingBids,
    loading,
    error,
    refetch: fetchMyBids
  };
}
