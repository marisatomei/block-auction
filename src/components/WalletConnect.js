'use client';

import { useState, useRef, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress } from '../utils/formatters';

export default function WalletConnect() {
  const { account, balance, isConnected, connectWallet, disconnectWallet, loading } = useWeb3();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setDropdownOpen(false);
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={loading}
        className="flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-[#0064D2] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <svg className="h-5 w-5" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14a2 2 0 0 1 2 2v4zM3 5v14a2 2 0 0 0 2 2h16v-5a2 2 0 0 0-2-2H5"></path>
          <path d="M18 19H6"></path>
        </svg>
        <span className="truncate">{loading ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span>{shortenAddress(account)}</span>
          <svg className="h-4 w-4 opacity-60" fill="currentColor" height="16" viewBox="0 0 256 256" width="16">
            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
          </svg>
        </button>
      </div>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-white p-2 shadow-lg ring-1 ring-black/5 z-50">
          <div className="p-2">
            <p className="text-xs text-gray-500">Balance</p>
            <p className="font-bold text-gray-800">{parseFloat(balance).toFixed(4)} ETH</p>
          </div>
          <div className="h-px bg-gray-200"></div>
          <button
            onClick={handleDisconnect}
            className="mt-1 flex w-full items-center gap-2 rounded p-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <svg className="h-4 w-4" fill="currentColor" height="16" viewBox="0 0 256 256" width="16">
              <path d="M136,40V88a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0Zm56,16.89A88,88,0,1,0,203.11,192,8,8,0,1,0,192,203.11,104,104,0,1,1,52.89,64a8,8,0,0,0,11.32-11.32A104.13,104.13,0,0,1,192,56.89Z"></path>
            </svg>
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );
}
