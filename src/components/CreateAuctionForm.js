'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../context/Web3Context';

export default function CreateAuctionForm() {
  const router = useRouter();
  const { factoryContract, isConnected } = useWeb3();
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    duration: '60'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    if (!formData.productName.trim()) {
      setError('Please enter a product name');
      return;
    }

    if (!formData.productDescription.trim()) {
      setError('Please enter a product description');
      return;
    }

    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration <= 0) {
      setError('Please enter a valid duration');
      return;
    }

    setLoading(true);

    try {
      const tx = await factoryContract.createAuction(
        formData.productName,
        formData.productDescription,
        duration
      );

      const receipt = await tx.wait();

      // Get auction address from event
      const event = receipt.logs.find(log => {
        try {
          return factoryContract.interface.parseLog(log).name === 'AuctionCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = factoryContract.interface.parseLog(event);
        const auctionAddress = parsedEvent.args.auctionAddress;

        // Redirect to auction detail page
        router.push(`/auction/${auctionAddress}`);
      } else {
        // Fallback to home page
        router.push('/');
      }
    } catch (err) {
      console.error('Error creating auction:', err);
      setError(err.message || 'Failed to create auction');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
          Product Name
        </label>
        <input
          type="text"
          id="productName"
          value={formData.productName}
          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
          disabled={loading}
          className="w-full rounded-md border-gray-300 px-4 py-3 text-gray-900 focus:border-[#0064D2] focus:ring-[#0064D2] disabled:bg-gray-100"
          placeholder="e.g., Digital Art Piece #001"
          required
        />
      </div>

      <div>
        <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-2">
          Product Description
        </label>
        <textarea
          id="productDescription"
          rows="4"
          value={formData.productDescription}
          onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
          disabled={loading}
          className="w-full rounded-md border-gray-300 px-4 py-3 text-gray-900 focus:border-[#0064D2] focus:ring-[#0064D2] disabled:bg-gray-100 resize-vertical"
          placeholder="Describe your product in detail..."
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Provide a detailed description to attract bidders
        </p>
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
          Duration (minutes)
        </label>
        <input
          type="number"
          id="duration"
          min="1"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          disabled={loading}
          className="w-full rounded-md border-gray-300 px-4 py-3 text-gray-900 focus:border-[#0064D2] focus:ring-[#0064D2] disabled:bg-gray-100"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Auction will run for {formData.duration || 0} minutes
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !isConnected}
        className="w-full rounded-full bg-[#86B817] py-4 text-lg font-bold text-white shadow-md hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Auction...
          </>
        ) : (
          'Create Auction'
        )}
      </button>

      {!isConnected && (
        <p className="text-center text-sm text-gray-500">
          Connect your wallet to create an auction
        </p>
      )}
    </form>
  );
}
