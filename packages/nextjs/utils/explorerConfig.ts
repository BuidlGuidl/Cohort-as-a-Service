// types.ts
// export type SupportedChainId = 1 | 137 | 42161 | 10 | 8453 | 84532 | 43114;

export interface ExplorerConfig {
  apiUrl: string;
  apiKey: string | undefined;
  browserUrl: string;
}

// explorerConfig.ts
export const BLOCK_EXPLORER_CONFIG: Record<number, ExplorerConfig> = {
  // Ethereum Mainnet
  1: {
    apiUrl: "https://api.etherscan.io/api",
    apiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW",
    browserUrl: "https://etherscan.io",
  },
  // Polygon
  137: {
    apiUrl: "https://api.polygonscan.com/api",
    apiKey: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY,
    browserUrl: "https://polygonscan.com",
  },
  // Arbitrum
  42161: {
    apiUrl: "https://api.arbiscan.io/api",
    apiKey: process.env.NEXT_PUBLIC_ARBISCAN_API_KEY || "XNGNDXRIBSUDGCUQY1TJC12GHT1N892SK5",
    browserUrl: "https://arbiscan.io",
  },
  // Optimism
  10: {
    apiUrl: "https://api-optimistic.etherscan.io/api",
    apiKey: process.env.NEXT_PUBLIC_OPTIMISTIC_ETHERSCAN_API_KEY || "RM62RDISS1RH448ZY379NX625ASG1N633R",
    browserUrl: "https://optimistic.etherscan.io",
  },
  // Base Mainnet
  8453: {
    apiUrl: "https://api.basescan.org/api",
    apiKey: process.env.NEXT_PUBLIC_BASESCAN_API_KEY || "ZZZEIPMT1MNJ8526VV2Y744CA7TNZR64G6",
    browserUrl: "https://basescan.org",
  },
  // Base Sepolia
  84532: {
    apiUrl: "https://api-sepolia.basescan.org/api",
    apiKey: process.env.NEXT_PUBLIC_BASESCAN_API_KEY || "ZZZEIPMT1MNJ8526VV2Y744CA7TNZR64G6",
    browserUrl: "https://sepolia.basescan.org",
  },
  // Avalanche
  43114: {
    apiUrl: "https://api.snowtrace.io/api",
    apiKey: process.env.NEXT_PUBLIC_SNOWTRACE_API_KEY,
    browserUrl: "https://snowtrace.io",
  },
  //Optimism Sepolia
  11155420: {
    apiUrl: "https://api-sepolia-optimistic.etherscan.io/api",
    apiKey: process.env.NEXT_PUBLIC_OPTIMISTIC_ETHERSCAN_API_KEY || "RM62RDISS1RH448ZY379NX625ASG1N633R",
    browserUrl: "https://sepolia-optimism.etherscan.io/o",
  },
};

// Helper functions
export function getExplorerConfig(chainId: number): ExplorerConfig {
  const config = BLOCK_EXPLORER_CONFIG[chainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return config;
}

export function getExplorerApiUrl(chainId: number): string {
  return getExplorerConfig(chainId).apiUrl;
}

export function getExplorerApiKey(chainId: number): string {
  const apiKey = getExplorerConfig(chainId).apiKey;
  if (!apiKey) {
    throw new Error(`No API key configured for chain ID: ${chainId}`);
  }
  return apiKey;
}

export function getExplorerBrowserUrl(chainId: number): string {
  return getExplorerConfig(chainId).browserUrl;
}
