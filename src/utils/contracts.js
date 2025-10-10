import { ethers } from 'ethers';
import { ErrorDecoder } from 'ethers-decode-error';
import { FACTORY_ADDRESS } from '../constants/config';
import { FACTORY_ABI, AUCTION_ABI } from './abis';

// Initialize error decoder with contract ABIs
const errorDecoder = ErrorDecoder.create([FACTORY_ABI, AUCTION_ABI]);

/**
 * Get factory contract instance
 * @param {ethers.Provider | ethers.Signer} providerOrSigner - Provider or signer
 * @returns {ethers.Contract} Factory contract instance
 */
export function getFactoryContract(providerOrSigner) {
  return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, providerOrSigner);
}

/**
 * Get auction contract instance
 * @param {string} auctionAddress - Address of the auction contract
 * @param {ethers.Provider | ethers.Signer} providerOrSigner - Provider or signer
 * @returns {ethers.Contract} Auction contract instance
 */
export function getAuctionContract(auctionAddress, providerOrSigner) {
  return new ethers.Contract(auctionAddress, AUCTION_ABI, providerOrSigner);
}

/**
 * Handle contract errors and return user-friendly messages
 * Uses ethers-decode-error to decode custom contract errors
 * @param {Error} error - Error from contract call
 * @returns {string} User-friendly error message
 */
export function handleContractError(error) {
  console.error('Contract error:', error);
  console.log('Error details:', {
    message: error.message,
    code: error.code,
    action: error.action,
    data: error.data,
    shortMessage: error.shortMessage,
    reason: error.reason
  });

  try {
    // Decode the error using ethers-decode-error
    const decodedError = errorDecoder.decode(error);

    // Log detailed error info for debugging
    console.log('Decoded error:', {
      name: decodedError.name,
      args: decodedError.args,
      reason: decodedError.reason
    });

    // Extract message from first argument (string message parameter)
    if (decodedError.args && decodedError.args.length > 0) {
      const message = decodedError.args[0];

      // If message is a string, return it directly from the contract
      if (typeof message === 'string' && message.length > 0) {
        return `❌ ${message}`;
      }
    }

    // Fallback if no message found in args but we have an error name
    const errorName = decodedError.name;
    if (errorName) {
      // Provide friendly messages for known errors
      const knownErrors = {
        'AlreadyClaimed': 'Funds have already been claimed for this auction.',
        'AuctionEnded': 'This auction has already ended.',
        'AuctionStillActive': 'Auction is still active. Please wait until it ends.',
        'AlreadyPlacedBid': 'You have already placed a bid on this auction.',
        'BidTooLow': 'Your bid is too low. Please increase your bid amount.',
        'NoBidToWithdraw': 'You have no bid to withdraw from this auction.',
        'CannotWithdrawAsWinner': 'As the winner, you cannot withdraw your bid.',
        'WithdrawalFailed': 'Withdrawal failed. Please check your wallet and try again.',
        'NotCreator': 'Only the auction creator can perform this action.',
        'NoWinnerYet': 'No winner yet. The auction needs at least one bid.',
        'InvalidCreatorAddress': 'Invalid creator address.',
        'AuctionAlreadyHasBids': 'Cannot cancel auction. Bids have already been placed.'
      };

      if (knownErrors[errorName]) {
        return `❌ ${knownErrors[errorName]}`;
      }

      return `❌ Contract error: ${errorName}`;
    }
  } catch (decodeError) {
    console.log('Could not decode error, falling back to string matching:', decodeError);
  }

  // Fallback to string matching for non-contract errors
  const errorString = error.message || error.toString();

  // User errors (MetaMask rejections, etc.)
  if (errorString.includes('user rejected') || errorString.includes('User denied')) {
    return '🚫 Transaction was rejected by user.';
  }

  if (errorString.includes('insufficient funds')) {
    return '💳 Insufficient funds in your wallet. Please add more ETH/BNB.';
  }

  if (errorString.includes('nonce')) {
    return '🔄 Transaction nonce error. Please try again.';
  }

  if (errorString.includes('gas')) {
    return '⛽ Gas estimation failed. The transaction might fail.';
  }

  if (errorString.includes('network')) {
    return '🌐 Network error. Please check your connection and try again.';
  }

  // Default error message with partial error info
  const shortError = errorString.substring(0, 100);
  return `❌ Transaction failed: ${shortError}${errorString.length > 100 ? '...' : ''}`;
}
