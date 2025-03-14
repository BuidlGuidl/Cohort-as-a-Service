import { Address } from "viem";

export interface ChainInfo {
  chainId: number;
  chainName: string;
  priceFeedAddress: Address;
}

export type SupportedChainId = 1 | 137 | 42161 | 10 | 8453 | 84532 | 11155420 | 534352;

export const NETWORK_NAMES = {
  ETHEREUM: "Ethereum",
  POLYGON: "Polygon",
  ARBITRUM: "Arbitrum",
  OPTIMISM: "Optimism",
  BASE: "Base",
  BASE_SEPOLIA: "Base Sepolia",
  OPTIMISM_SEPOLIA: "Optimism Sepolia",
  SCROLL: "Scroll",
} as const;

export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BASE: 8453,
  BASE_SEPOLIA: 84532,
  OPTIMISM_SEPOLIA: 11155420,
  SCROLL: 534352,
} as const;

export const CHAINLINK_PRICE_FEEDS: Record<SupportedChainId, ChainInfo> = {
  [CHAIN_IDS.ETHEREUM]: {
    chainId: CHAIN_IDS.ETHEREUM,
    chainName: NETWORK_NAMES.ETHEREUM,
    priceFeedAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  },
  [CHAIN_IDS.POLYGON]: {
    chainId: CHAIN_IDS.POLYGON,
    chainName: NETWORK_NAMES.POLYGON,
    priceFeedAddress: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
  },
  [CHAIN_IDS.ARBITRUM]: {
    chainId: CHAIN_IDS.ARBITRUM,
    chainName: NETWORK_NAMES.ARBITRUM,
    priceFeedAddress: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
  },
  [CHAIN_IDS.OPTIMISM]: {
    chainId: CHAIN_IDS.OPTIMISM,
    chainName: NETWORK_NAMES.OPTIMISM,
    priceFeedAddress: "0x13e3Ee699D1909E989722E753853AE30b17e08c5",
  },
  [CHAIN_IDS.BASE]: {
    chainId: CHAIN_IDS.BASE,
    chainName: NETWORK_NAMES.BASE,
    priceFeedAddress: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
  },
  [CHAIN_IDS.BASE_SEPOLIA]: {
    chainId: CHAIN_IDS.BASE_SEPOLIA,
    chainName: NETWORK_NAMES.BASE_SEPOLIA,
    priceFeedAddress: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
  },
  [CHAIN_IDS.OPTIMISM_SEPOLIA]: {
    chainId: CHAIN_IDS.OPTIMISM_SEPOLIA,
    chainName: NETWORK_NAMES.OPTIMISM_SEPOLIA,
    priceFeedAddress: "0x61Ec26aA57019C486B10502285c5A3D4A4750AD7",
  },
  [CHAIN_IDS.SCROLL]: {
    chainId: CHAIN_IDS.SCROLL,
    chainName: NETWORK_NAMES.SCROLL,
    priceFeedAddress: "0x6bF14CB0A831078629D993FDeBcB182b21A8774C",
  },
};

export const isChainSupported = (chainId: number): chainId is SupportedChainId => {
  return chainId in CHAINLINK_PRICE_FEEDS;
};

export const getPriceFeedInfo = (chainId: number): ChainInfo | undefined => {
  if (!isChainSupported(chainId)) {
    return undefined;
  }
  return CHAINLINK_PRICE_FEEDS[chainId];
};
