import { NextRequest, NextResponse } from 'next/server';

// Verifier configuration by source chain
const VERIFIER_CONFIG: Record<number, { path: string; sourceId: string }> = {
  // Flare Mainnet
  14: {
    path: 'flr',
    sourceId: '0x464c520000000000000000000000000000000000000000000000000000000000',
  },
  // Ethereum Mainnet
  1: {
    path: 'eth',
    sourceId: '0x4554480000000000000000000000000000000000000000000000000000000000',
  },
  // Sepolia Testnet
  11155111: {
    path: 'sepolia',
    sourceId: '0x7465737445544800000000000000000000000000000000000000000000000000',
  },
  // Coston2 (legacy)
  114: {
    path: 'c2flr',
    sourceId: '0x7465737443324652000000000000000000000000000000000000000000000000',
  },
};

// Verifier base URLs by Flare network
const VERIFIER_BASE_URLS: Record<number, string> = {
  14: 'https://fdc-verifiers-mainnet.flare.network/verifier',
  114: 'https://fdc-verifiers-testnet.flare.network/verifier',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both old format (chainId only) and new format (flareChainId + sourceChainId)
    const { chainId, flareChainId, sourceChainId, ...requestBody } = body;
    
    // Determine Flare chain (where FDC runs) and source chain (where tx happened)
    // For backward compatibility: if only chainId is provided, use it as both
    const effectiveFlareChainId = flareChainId ?? chainId ?? 14;
    const effectiveSourceChainId = sourceChainId ?? chainId ?? 14;
    
    // Get the base verifier URL for the Flare network
    const baseUrl = VERIFIER_BASE_URLS[effectiveFlareChainId as keyof typeof VERIFIER_BASE_URLS];
    if (!baseUrl) {
      return NextResponse.json(
        { error: `Unsupported Flare chain ID: ${effectiveFlareChainId}` },
        { status: 400 }
      );
    }
    
    // Get the source chain configuration
    const sourceConfig = VERIFIER_CONFIG[effectiveSourceChainId as keyof typeof VERIFIER_CONFIG];
    if (!sourceConfig) {
      return NextResponse.json(
        { error: `Unsupported source chain ID: ${effectiveSourceChainId}. FDC EVMTransaction only supports Flare, Ethereum, and testnets.` },
        { status: 400 }
      );
    }
    
    // Build the verifier URL
    const verifierUrl = `${baseUrl}/${sourceConfig.path}/EVMTransaction/prepareRequest`;
    
    // Make the request to the verifier
    const response = await fetch(verifierUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': '00000000-0000-0000-0000-000000000000', // Flare's public FDC verifier key
      },
      body: JSON.stringify({
        ...requestBody,
        sourceId: sourceConfig.sourceId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Verifier error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('FDC prepare request error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
