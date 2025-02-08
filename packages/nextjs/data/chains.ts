export interface Chain {
  id: string;
  name: string;
  chainId: number;
  icon: string;
  isEVM: boolean;
}

export const baseChainId = 31337;

export const chains: Chain[] = [
  {
    id: "bnb",
    name: "BNB Chain",
    chainId: 56,
    icon: "/chain/56.svg",
    isEVM: true,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    chainId: 1,
    icon: "/chain/1.svg",
    isEVM: true,
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    chainId: 42161,
    icon: "/chain/42161.svg",
    isEVM: true,
  },
  {
    id: "polygon",
    name: "Polygon",
    chainId: 137,
    icon: "/chain/137.png",
    isEVM: true,
  },
  {
    id: "avax",
    name: "AVAX",
    chainId: 43114,
    icon: "/chain/43114.svg",
    isEVM: true,
  },
  {
    id: "optimism",
    name: "Optimism",
    chainId: 10,
    icon: "/chain/10.svg",
    isEVM: true,
  },
  {
    id: "base",
    name: "Base",
    chainId: 8453,
    icon: "/chain/8453.svg",
    isEVM: true,
  },
  {
    id: "base-sepolia",
    name: "Base Sepolia",
    chainId: 84532,
    icon: "/chain/84532.svg",
    isEVM: true,
  },
];
