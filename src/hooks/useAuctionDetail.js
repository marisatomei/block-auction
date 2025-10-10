'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getAuctionContract, handleContractError } from '../utils/contracts';

/**
 * Hook to manage a single auction's details and interactions
 */
export function useAuctionDetail(auctionAddress) {
  const { signer, provider, account } = useWeb3();
  const [auction, setAuction] = useState(null);
  const [userBid, setUserBid] = useState(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txLoading, setTxLoading] = useState(false);

  /**
   * Fetch auction details
   */
  const fetchAuctionDetails = useCallback(async () => {
    if (!auctionAddress || !provider) return;

    setLoading(true);
    setError(null);

    try {
      const auctionContract = getAuctionContract(auctionAddress, provider);
      const details = await auctionContract.getAuctionDetails();

      // Use the contract's isActive calculation (block.timestamp <= auctionEndTime)
      // This is the source of truth from the blockchain
      setAuction({
        address: auctionAddress,
        productName: details[0],
        productDescription: details[1],
        creator: details[2],
        endTime: Number(details[3]),
        highestBidder: details[4],
        highestBid: details[5],
        isActive: details[6], // Contract calculates this using block.timestamp
        claimed: details[7] // Whether creator has claimed funds
      });

      // Get user's bid if connected
      if (account) {
        const bid = await auctionContract.bids(account);
        setUserBid(bid);
      }
    } catch (err) {
      console.error('Error fetching auction details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [auctionAddress, provider, account]);

  /**
   * Place a bid
   */
  const placeBid = useCallback(async (bidAmount) => {
    if (!signer || !auctionAddress) {
      throw new Error('Wallet not connected');
    }

    setTxLoading(true);
    setError(null);

    try {
      const auctionContract = getAuctionContract(auctionAddress, signer);
      const tx = await auctionContract.placeBid({ value: bidAmount });
      await tx.wait();

      // Refresh auction details
      await fetchAuctionDetails();

      return true;
    } catch (err) {
      const errorMessage = handleContractError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setTxLoading(false);
    }
  }, [signer, auctionAddress, fetchAuctionDetails]);

  /**
   * Withdraw bid
   */
  const withdraw = useCallback(async () => {
    if (!signer || !auctionAddress) {
      throw new Error('Wallet not connected');
    }

    setTxLoading(true);
    setError(null);

    try {
      const auctionContract = getAuctionContract(auctionAddress, signer);
      const tx = await auctionContract.withdraw();
      await tx.wait();

      // Refresh auction details
      await fetchAuctionDetails();

      return true;
    } catch (err) {
      const errorMessage = handleContractError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setTxLoading(false);
    }
  }, [signer, auctionAddress, fetchAuctionDetails]);

  /**
   * Get winner
   */
  const getWinner = useCallback(async () => {
    if (!auctionAddress || !provider) {
      throw new Error('Auction not found');
    }

    try {
      const auctionContract = getAuctionContract(auctionAddress, provider);
      const winner = await auctionContract.getWinner();
      return winner;
    } catch (err) {
      const errorMessage = handleContractError(err);
      throw new Error(errorMessage);
    }
  }, [auctionAddress, provider]);

  /**
   * Claim funds (for auction creator)
   */
  const claimFunds = useCallback(async () => {
    if (!signer || !auctionAddress) {
      throw new Error('Wallet not connected');
    }

    setTxLoading(true);
    setError(null);

    try {
      const auctionContract = getAuctionContract(auctionAddress, signer);
      const tx = await auctionContract.claimFunds();
      await tx.wait();

      // Refresh auction details
      await fetchAuctionDetails();

      return true;
    } catch (err) {
      const errorMessage = handleContractError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setTxLoading(false);
    }
  }, [signer, auctionAddress, fetchAuctionDetails]);

  /**
   * Cancel auction (for auction creator, only if no bids)
   */
  const cancelAuction = useCallback(async () => {
    if (!signer || !auctionAddress) {
      throw new Error('Wallet not connected');
    }

    setTxLoading(true);
    setError(null);

    try {
      const auctionContract = getAuctionContract(auctionAddress, signer);
      const tx = await auctionContract.cancelAuction();
      await tx.wait();

      // Refresh auction details
      await fetchAuctionDetails();

      return true;
    } catch (err) {
      const errorMessage = handleContractError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setTxLoading(false);
    }
  }, [signer, auctionAddress, fetchAuctionDetails]);

  // Fetch auction details on mount
  useEffect(() => {
    fetchAuctionDetails();
  }, [fetchAuctionDetails]);

  // Listen for new bids
  useEffect(() => {
    if (!auctionAddress || !provider) return;

    const auctionContract = getAuctionContract(auctionAddress, provider);

    const handleNewBid = () => {
      // Force immediate refresh when new bid event is received
      fetchAuctionDetails();
    };

    auctionContract.on('NewBid', handleNewBid);

    return () => {
      auctionContract.off('NewBid', handleNewBid);
    };
  }, [auctionAddress, provider, fetchAuctionDetails]);

  return {
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
    refetch: fetchAuctionDetails
  };
}
