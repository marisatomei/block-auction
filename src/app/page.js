'use client';

import { useWeb3 } from '../context/Web3Context';
import { useAuctions } from '../hooks/useAuctions';
import AuctionGrid from '../components/AuctionGrid';
import MyBids from '../components/MyBids';
import Link from 'next/link';

export default function Home() {
  const { auctions, loading } = useAuctions();
  const { isConnected, account } = useWeb3();

  return (
    <main className="flex-1 bg-gray-100 px-4 py-10 sm:px-10 lg:px-20 xl:px-40">
      <div className="mx-auto max-w-7xl">
        {/* All Auctions Section */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isConnected && account ? 'All Auctions' : 'Featured Auctions'}
          </h1>
          {isConnected && (
            <Link
              href="/create"
              className="rounded-full bg-[#86B817] px-6 py-2 text-sm font-bold text-white hover:bg-green-700"
            >
              Create Auction
            </Link>
          )}
        </div>

        <AuctionGrid auctions={auctions} loading={loading} />

        {/* My Bids Section - Show below all auctions when connected */}
        {isConnected && account && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">My Bids</h2>
            <MyBids />
          </div>
        )}
      </div>
    </main>
  );
}
