// SPARK Protocol Contract Addresses on Kaia Testnet
export const CONTRACT_ADDRESSES = {
  // Deployed on Kaia Kairos Testnet
  TRUST_MATRIX_SCORER: "0x88f89504F32A1439B44e7aaad3AAAd6dA5BBc13e",
  KAIA_SPARK_FACTORY: "0xc82abc101a87De2c127cc3c603b8D2aF237D8dA6",
  SOCIAL_MARKETING_AI: "0x397c7048A62522451234d39A0E9623969B15C656",
  QUANTUM_LENDING_POOL: "0x263B640De8A08bbdDec09a64a540149353626908",
  USDT_TOKEN: "0x55d398326f99059fF775485246999027B3197955",
};

// Kaia Testnet Configuration
export const NETWORK_CONFIG = {
  chainId: 1001, // Kaia Kairos Testnet
  chainName: "Kaia Kairos Testnet",
  rpcUrl: "https://public-en-kairos.node.kaia.io",
  blockExplorer: "https://kairos.kaiaexplorer.io/",
  nativeCurrency: {
    name: "KAIA",
    symbol: "KAIA",
    decimals: 18,
  },
};

// Contract ABIs (we'll add these as we integrate)
export const CONTRACT_ABIS = {
  // Will be populated with actual ABIs
};
