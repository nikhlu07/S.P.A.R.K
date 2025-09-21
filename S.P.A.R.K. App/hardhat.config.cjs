require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const config = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    kaiaTestnet: {
      url: "https://public-en-kairos.node.kaia.io",
      chainId: 0x3e9, // 1001 in decimal (Kaia Kairos Testnet)
      accounts: ["0x1e8d32fa33366b326512ff8da6fc1b30aadef05ca7a45c8402699e7bd3a128fb"],
      gasPrice: 25000000000, // 25 Gwei
    },
    kaiaMainnet: {
      url: "https://public-en.node.kaia.io",
      chainId: 0x1e4a, // 7750 in decimal
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 Gwei
    },
  },
  etherscan: {
    apiKey: {
      kairos: "unnecessary",
      kaia: "unnecessary",
    },
    customChains: [
      {
        network: "kairos",
        chainId: 1001,
        urls: {
          apiURL: "https://kairos-api.kaiascan.io/hardhat-verify",
          browserURL: "https://kairos.kaiascan.io",
        },
      },
      {
        network: "kaia",
        chainId: 8217,
        urls: {
          apiURL: "https://mainnet-api.kaiascan.io/hardhat-verify",
          browserURL: "https://kaiascan.io",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

module.exports = config;
