'use client';

import Link from 'next/link';
import { useCountdown } from '../hooks/useCountdown';
import { formatEther } from '../utils/formatters';

export default function AuctionCard({ auction }) {
  const { formattedTime, isEnded } = useCountdown(auction.endTime);

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/auction/${auction.address}`} className="block overflow-hidden">
        <div
          className="h-56 w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105 bg-gradient-to-br from-purple-400 to-indigo-600"
          style={{
            backgroundImage: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
          }}
        >
          <div className="h-full w-full flex items-center justify-center bg-black/10">
            <div className="text-white text-4xl font-bold opacity-30">
              {auction.productName.charAt(0)}
            </div>
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-gray-800">
          <Link href={`/auction/${auction.address}`} className="hover:text-[#0064D2]">
            {auction.productName}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {auction.productDescription}
        </p>
        <div className="mt-3 flex-1">
          <p className="text-sm text-gray-600">Current Bid</p>
          <p className="text-xl font-bold text-gray-900">
            {auction.highestBid > 0 ? `${formatEther(auction.highestBid)} ETH` : 'No bids yet'}
          </p>
        </div>
        <p className={`mt-2 text-sm font-semibold ${isEnded ? 'text-gray-500' : 'text-red-600'}`}>
          {isEnded ? 'Auction Ended' : `Ending in ${formattedTime}`}
          
        </p>
      </div>
    </div>
  );
}
