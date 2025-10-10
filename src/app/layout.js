import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "../context/Web3Context";
import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AuctionDapp - Decentralized Auction Platform",
  description: "Create and participate in decentralized auctions on the blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-800`}
      >
        <Web3Provider>
          <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
            <div className="flex h-full grow flex-col">
              <Header />
              {children}
            </div>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
