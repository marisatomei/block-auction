'use client';

import Link from 'next/link';
import WalletConnect from './WalletConnect';

export default function Header() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-b-gray-200 px-10 py-4 bg-white">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
          <span className="text-[#E53238]">A</span>
          <span className="text-[#0064D2]">u</span>
          <span className="text-[#F5AF02]">c</span>
          <span className="text-[#86B817]">t</span>
          <span className="text-black">ionDapp</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-8">
        <div className="w-full max-w-2xl">
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <input
              className="w-full rounded-full border-2 border-gray-300 bg-gray-100 py-2 pl-12 pr-4 text-gray-800 focus:border-[#0064D2] focus:outline-none focus:ring-1 focus:ring-[#0064D2]"
              placeholder="Search for anything"
              type="search"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
          </form>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#0064D2]">
            Explore
          </Link>
          <Link href="/create" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#0064D2]">
            Create Auction
          </Link>
        </nav>
        <div className="h-8 w-px bg-gray-200"></div>
        <WalletConnect />
      </div>
    </header>
  );
}
