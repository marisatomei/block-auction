'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getAuctionContract } from '../utils/contracts';

/**
 * Hook to fetch and manage all auctions
 */
export function useAuctions() {
  const { factoryContract, provider } = useWeb3();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all auctions from factory
   */
  const fetchAuctions = useCallback(async () => {
    if (!factoryContract || !provider) return;

    setLoading(true);
    setError(null);

    try {
      // Get all auction addresses
      const auctionAddresses = await factoryContract.getAllAuctions();

      // Fetch details for each auction with individual error handling
      const auctionPromises = auctionAddresses.map(async (address) => {
        try {
          const auctionContract = getAuctionContract(address, provider);
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
            claimed: details[7] // Whether creator has claimed funds
          };
        } catch (err) {
          console.error(`Error fetching auction ${address}:`, err);
          return null; // Return null for failed fetches
        }
      });

      const auctionsData = await Promise.all(auctionPromises);

      // Filter out failed fetches and sort by creation time (most recent first)
      const validAuctions = auctionsData.filter(auction => auction !== null);
      validAuctions.reverse();

      setAuctions(validAuctions);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [factoryContract, provider]);

  // Fetch auctions on mount and when factory contract changes
  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Listen for new auctions
  useEffect(() => {
    if (!factoryContract) return;

    const handleAuctionCreated = () => {
      fetchAuctions();
    };

    factoryContract.on('AuctionCreated', handleAuctionCreated);

    return () => {
      factoryContract.off('AuctionCreated', handleAuctionCreated);
    };
  }, [factoryContract, fetchAuctions]);

  return {
    auctions,
    loading,
    error,
    refetch: fetchAuctions
  };
}
