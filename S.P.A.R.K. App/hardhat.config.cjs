require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
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
      kaiaTestnet: "your-kaia-api-key",
      kaiaMainnet: "your-kaia-api-key",
    },
    customChains: [
      {
        network: "kaiaTestnet",
        chainId: 0x3e9,
        urls: {
          apiURL: "https://kairos.kaiaexplorer.io/api",
          browserURL: "https://kairos.kaiaexplorer.io/",
        },
      },
      {
        network: "kaiaMainnet",
        chainId: 0x1e4a,
        urls: {
          apiURL: "https://kaiaexplorer.io/api",
          browserURL: "https://kaiaexplorer.io/",
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
