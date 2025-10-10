'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { NETWORK_CONFIG } from '../constants/config';
import { getFactoryContract } from '../utils/contracts';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [state, setState] = useState({
    account: null,
    provider: null,
    signer: null,
    balance: '0',
    isConnected: false,
    isCorrectNetwork: false,
    factoryContract: null,
    loading: false,
    error: null
  });

  // Ref to prevent auto-connect from running multiple times
  const hasAutoConnected = useRef(false);

  /**
   * Check if connected to correct network
   */
  const checkNetwork = useCallback(async (provider) => {
    try {
      const network = await provider.getNetwork();
      const expectedChainId = parseInt(NETWORK_CONFIG.chainId, 16);
      return Number(network.chainId) === expectedChainId;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }, []);

  /**
   * Switch to correct network
   */
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainId }]
      });
      return true;
    } catch (switchError) {
      // Network doesn't exist, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG]
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    }
  }, []);

  /**
   * Connect wallet
   */
  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const detectedProvider = await detectEthereumProvider();

      if (!detectedProvider) {
        throw new Error('Please install MetaMask');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = accounts[0];

      // Check network
      const isCorrect = await checkNetwork(provider);

      if (!isCorrect) {
        const switched = await switchNetwork();
        if (!switched) {
          throw new Error('Please switch to the correct network');
        }
      }

      // Get balance
      const balance = await provider.getBalance(account);
      const balanceInEther = ethers.formatEther(balance);

      // Get factory contract
      const factoryContract = getFactoryContract(signer);

      setState({
        account,
        provider,
        signer,
        balance: balanceInEther,
        isConnected: true,
        isCorrectNetwork: true,
        factoryContract,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [checkNetwork, switchNetwork]);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setState({
      account: null,
      provider: null,
      signer: null,
      balance: '0',
      isConnected: false,
      isCorrectNetwork: false,
      factoryContract: null,
      loading: false,
      error: null
    });
  }, []);

  /**
   * Update balance
   */
  const updateBalance = useCallback(async () => {
    if (state.provider && state.account) {
      try {
        const balance = await state.provider.getBalance(state.account);
        const balanceInEther = ethers.formatEther(balance);
        setState(prev => ({ ...prev, balance: balanceInEther }));
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  }, [state.provider, state.account]);

  // Setup event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // Disconnect: reset state directly instead of calling disconnectWallet
        setState({
          account: null,
          provider: null,
          signer: null,
          balance: '0',
          isConnected: false,
          isCorrectNetwork: false,
          factoryContract: null,
          loading: false,
          error: null
        });
      } else {
        // Account changed: reload to reconnect with new account
        window.location.reload();
      }
    };

    const handleChainChanged = () => {
      // Network changed: reload to update provider
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []); // No dependencies - handlers are stable

  // Auto-connect if previously connected
  useEffect(() => {
    // Prevent running multiple times
    if (hasAutoConnected.current) return;

    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          hasAutoConnected.current = true;
          await connectWallet();
        }
      }
    };

    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const value = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    updateBalance
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
}
