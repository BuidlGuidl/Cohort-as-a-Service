import { getTargetNetworks } from "~~/utils/scaffold-eth";

export interface Chain {
  id: string;
  name: string;
  chainId: number;
  icon: string;
  isEVM: boolean;
}

export const baseChainId = 84532;

export const chains: Chain[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    chainId: 1,
    icon: "/chain/1.svg",
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
    id: "scroll",
    name: "Scroll",
    chainId: 534352,
    icon: "/chain/534352.svg",
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

  {
    id: "unichain",
    name: "Unichain",
    chainId: 130,
    icon: "/chain/unichain.png",
    isEVM: true,
  },
  // {
  //   id: "ink",
  //   name: "Ink",
  //   chainId: 57073,
  //   icon: "/chain/ink.png",
  //   isEVM: true,
  // },
];

const allNetworks = getTargetNetworks();

export function getChainById(id: number) {
  for (const chain of Object.values(allNetworks)) {
    if ("id" in chain) {
      if (chain.id === id) {
        return chain;
      }
    }
  }
}
