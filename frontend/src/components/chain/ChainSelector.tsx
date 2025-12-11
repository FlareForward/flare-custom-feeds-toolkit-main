'use client';

import { Check, AlertTriangle, Info, Coins } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SUPPORTED_CHAINS, 
  getDirectChains, 
  getSelectableChains,
  type SupportedChain 
} from '@/lib/chains';

interface ChainSelectorProps {
  value: number | undefined;
  onChange: (chainId: number) => void;
  disabled?: boolean;
  includeTestnets?: boolean;
  showGasWarning?: boolean;  // Show warning about needing gas on source chain
}

export function ChainSelector({ 
  value, 
  onChange, 
  disabled, 
  includeTestnets = true,
  showGasWarning = true,
}: ChainSelectorProps) {
  const selectedChain = value ? SUPPORTED_CHAINS.find(c => c.id === value) : undefined;
  const directChains = getDirectChains(includeTestnets);
  
  // Phase 1: Only show direct chains
  const selectableChains = getSelectableChains(includeTestnets);
  
  return (
    <div className="space-y-3">
      <Select
        value={value?.toString()}
        onValueChange={(v) => onChange(parseInt(v))}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select source chain">
            {selectedChain && (
              <span className="flex items-center gap-2">
                <ChainIcon chainId={selectedChain.id} />
                {selectedChain.name}
                {selectedChain.testnet && (
                  <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                    Testnet
                  </span>
                )}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Direct (Trustless FDC)
            </SelectLabel>
            {directChains.map(chain => (
              <SelectItem key={chain.id} value={chain.id.toString()}>
                <div className="flex items-center gap-2">
                  <ChainIcon chainId={chain.id} />
                  <span>{chain.name}</span>
                  {chain.id === 14 && (
                    <span className="text-xs text-muted-foreground">(Current)</span>
                  )}
                  {chain.testnet && (
                    <span className="text-xs bg-secondary px-1 rounded">Test</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          
          {/* Phase 1: Show relay chains as "Coming Soon" */}
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2 mt-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Relay Chains (Coming Soon)
            </SelectLabel>
            {/* Disabled relay chain options */}
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              Arbitrum, Base, Optimism, Polygon
            </div>
          </SelectGroup>
        </SelectContent>
      </Select>
      
      {/* Gas requirement warning for non-Flare chains */}
      {showGasWarning && selectedChain && selectedChain.id !== 14 && selectedChain.category === 'direct' && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
          <Coins className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <strong>Gas Required:</strong> You need {selectedChain.nativeCurrency.symbol} on{' '}
            {selectedChain.name} to record prices. The feed contract stays on Flare.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Simple chain icon component
function ChainIcon({ chainId }: { chainId: number }) {
  // Use colored circles with first letter as simple icons
  const getChainStyle = (id: number) => {
    switch (id) {
      case 14:
        return { bg: 'bg-[#E62058]', text: 'F' }; // Flare pink
      case 1:
        return { bg: 'bg-[#627EEA]', text: 'E' }; // Ethereum blue
      case 11155111:
        return { bg: 'bg-[#627EEA]', text: 'S' }; // Sepolia (Ethereum blue)
      case 42161:
        return { bg: 'bg-[#28A0F0]', text: 'A' }; // Arbitrum blue
      case 8453:
        return { bg: 'bg-[#0052FF]', text: 'B' }; // Base blue
      case 10:
        return { bg: 'bg-[#FF0420]', text: 'O' }; // Optimism red
      case 137:
        return { bg: 'bg-[#8247E5]', text: 'P' }; // Polygon purple
      default:
        return { bg: 'bg-gray-500', text: '?' };
    }
  };

  const style = getChainStyle(chainId);
  
  return (
    <div className={`w-5 h-5 rounded-full ${style.bg} flex items-center justify-center`}>
      <span className="text-white text-xs font-bold">{style.text}</span>
    </div>
  );
}

// Export ChainIcon for use in other components
export { ChainIcon };

// Chain badge for displaying in cards
interface ChainBadgeProps {
  chainId: number;
  chainName?: string;
  showIcon?: boolean;
  className?: string;
}

export function ChainBadge({ chainId, chainName, showIcon = true, className = '' }: ChainBadgeProps) {
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
  const name = chainName || chain?.name || 'Unknown';
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-xs ${className}`}>
      {showIcon && <ChainIcon chainId={chainId} />}
      <span>{name}</span>
    </div>
  );
}
