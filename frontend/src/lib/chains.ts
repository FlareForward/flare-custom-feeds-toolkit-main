// Chain configuration for cross-chain support
// Phase 1: Direct chains only (Flare, Ethereum, Sepolia)
// Phase 2+: Relay chains will be added

export type ChainCategory = 'direct' | 'relay';

export interface SupportedChain {
  id: number;
  name: string;
  category: ChainCategory;
  sourceId?: `0x${string}`;
  verifierPath?: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  testnet?: boolean;
}

export const SUPPORTED_CHAINS: SupportedChain[] = [
  // === DIRECT CHAINS (Mainnet) ===
  {
    id: 14,
    name: 'Flare',
    category: 'direct',
    sourceId: '0x464c520000000000000000000000000000000000000000000000000000000000',
    verifierPath: 'flr',
    rpcUrl: 'https://flare-api.flare.network/ext/bc/C/rpc',
    explorerUrl: 'https://flare-explorer.flare.network',
    nativeCurrency: { name: 'Flare', symbol: 'FLR', decimals: 18 },
  },
  {
    id: 1,
    name: 'Ethereum',
    category: 'direct',
    sourceId: '0x4554480000000000000000000000000000000000000000000000000000000000',
    verifierPath: 'eth',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  // === DIRECT CHAINS (Testnet) ===
  {
    id: 11155111,
    name: 'Sepolia',
    category: 'direct',
    sourceId: '0x7465737445544800000000000000000000000000000000000000000000000000', // testETH
    verifierPath: 'sepolia',
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    testnet: true,
  },
  // === RELAY CHAINS (Phase 2+) ===
  // These are defined but not enabled in Phase 1
  {
    id: 42161,
    name: 'Arbitrum',
    category: 'relay',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 8453,
    name: 'Base',
    category: 'relay',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 10,
    name: 'Optimism',
    category: 'relay',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 137,
    name: 'Polygon',
    category: 'relay',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
];

export function getChainById(chainId: number): SupportedChain | undefined {
  return SUPPORTED_CHAINS.find(c => c.id === chainId);
}

export function isDirectChain(chainId: number): boolean {
  return getChainById(chainId)?.category === 'direct';
}

export function isRelayChain(chainId: number): boolean {
  return getChainById(chainId)?.category === 'relay';
}

export function getDirectChains(includeTestnets = true): SupportedChain[] {
  return SUPPORTED_CHAINS.filter(c => 
    c.category === 'direct' && (includeTestnets || !c.testnet)
  );
}

export function getRelayChains(): SupportedChain[] {
  return SUPPORTED_CHAINS.filter(c => c.category === 'relay');
}

// Phase 1: Only return direct chains for selection
export function getSelectableChains(includeTestnets = true): SupportedChain[] {
  return getDirectChains(includeTestnets);
}

// Get chain explorer URL for address or transaction
export function getChainExplorerUrl(
  chainId: number, 
  type: 'address' | 'tx', 
  hash: string
): string {
  const chain = getChainById(chainId);
  if (!chain?.explorerUrl) return '#';
  return `${chain.explorerUrl}/${type === 'address' ? 'address' : 'tx'}/${hash}`;
}
