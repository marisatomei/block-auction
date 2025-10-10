import { ethers } from 'ethers';

/**
 * Format an Ethereum address to a shortened version
 * @param {string} address - Full Ethereum address
 * @param {number} startChars - Number of characters to show at start
 * @param {number} endChars - Number of characters to show at end
 * @returns {string} Formatted address (e.g., "0x1234...5678")
 */
export function shortenAddress(address, startChars = 6, endChars = 4) {
  if (!address) return '';
  if (address.length < startChars + endChars) return address;

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format wei to ether string
 * @param {bigint} wei - Wei amount
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted ether amount
 */
export function formatEther(wei, decimals = 4) {
  if (!wei) return '0';

  const etherValue = ethers.formatEther(wei);
  const num = parseFloat(etherValue);

  return num.toFixed(decimals);
}

/**
 * Format time remaining to human-readable string
 * @param {number} seconds - Seconds remaining
 * @returns {string} Formatted time (e.g., "2d 12h 30m")
 */
export function formatTimeRemaining(seconds) {
  if (seconds <= 0) return 'Ended';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds < 60 && secs > 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0s';
}

/**
 * Format countdown timer (HH:MM:SS)
 * @param {number} seconds - Seconds remaining
 * @returns {string} Formatted countdown
 */
export function formatCountdown(seconds) {
  if (seconds <= 0) return '00:00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid
 */
export function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Parse ether string to wei bigint
 * @param {string} etherAmount - Ether amount as string
 * @returns {bigint} Wei amount
 */
export function parseEther(etherAmount) {
  try {
    return ethers.parseEther(etherAmount || '0');
  } catch {
    return 0n;
  }
}
