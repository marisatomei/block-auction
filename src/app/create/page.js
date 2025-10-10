'use client';

import { useWeb3 } from '../../context/Web3Context';
import CreateAuctionForm from '../../components/CreateAuctionForm';
import Link from 'next/link';

export default function CreateAuctionPage() {
  const { isConnected } = useWeb3();

  return (
    <main className="flex-1 bg-gray-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#0064D2] hover:underline">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-gray-700">Create Auction</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create New Auction
          </h1>
          <p className="mt-2 text-gray-600">
            Create a decentralized auction on the blockchain. Your auction will be visible to everyone and bids are recorded transparently.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          {!isConnected ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Wallet Not Connected</h3>
              <p className="mt-2 text-sm text-gray-500">
                Please connect your wallet to create an auction.
              </p>
            </div>
          ) : (
            <CreateAuctionForm />
          )}
        </div>

        {/* Info Cards */}
        {isConnected && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-900">How it works</h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• Set your product name and duration</li>
                <li>• Your auction deploys on the blockchain</li>
                <li>• Users can start bidding immediately</li>
                <li>• Winner is determined when time expires</li>
              </ul>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <h3 className="font-semibold text-green-900">Benefits</h3>
              <ul className="mt-2 space-y-1 text-sm text-green-800">
                <li>• Transparent and trustless</li>
                <li>• No intermediaries</li>
                <li>• Automatic fund distribution</li>
                <li>• Immutable auction records</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
