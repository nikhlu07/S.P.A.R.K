const { ethers } = require("hardhat");

// Manually set the private key if not loaded from .env
if (!process.env.PRIVATE_KEY) {
  process.env.PRIVATE_KEY = "0x1e8d32fa33366b326512ff8da6fc1b30aadef05ca7a45c8402699e7bd3a128fb";
}

// Kaia Testnet (Kairos) USDT Token Address
// This is the official USDT token on Kaia testnet
const KAIA_TESTNET_USDT = "0x55d398326f99059fF775485246999027B3197955";

// Kaia Testnet (Kairos) Configuration
const KAIA_TESTNET_CONFIG = {
  chainId: 0x3e9, // 1001 in decimal
  chainName: "Kaia Kairos Testnet",
  nativeCurrency: { name: "KAIA", symbol: "KAIA", decimals: 18 },
  rpcUrls: ["https://public-en-kairos.node.kaia.io"],
  blockExplorerUrls: ["https://kairos.kaiaexplorer.io/"],
};

async function main() {
  console.log("🚀 Deploying SPARK Protocol to Kaia Testnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "KAIA");

  // Deploy TrustMatrixScorer first (needed by other contracts)
  console.log("\n📊 Deploying TrustMatrixScorer...");
  const TrustMatrixScorer = await ethers.getContractFactory("TrustMatrixScorer");
  const trustMatrixScorer = await TrustMatrixScorer.deploy();
  await trustMatrixScorer.waitForDeployment();
  const trustMatrixScorerAddress = await trustMatrixScorer.getAddress();
  console.log("TrustMatrixScorer deployed to:", trustMatrixScorerAddress);

  // Deploy KaiaSparkFactory
  console.log("\n🏭 Deploying KaiaSparkFactory...");
  const KaiaSparkFactory = await ethers.getContractFactory("KaiaSparkFactory");
  const kaiaSparkFactory = await KaiaSparkFactory.deploy(
    KAIA_TESTNET_USDT, // USDT token address
    deployer.address // Fee recipient
  );
  await kaiaSparkFactory.waitForDeployment();
  const kaiaSparkFactoryAddress = await kaiaSparkFactory.getAddress();
  console.log("KaiaSparkFactory deployed to:", kaiaSparkFactoryAddress);

  // Deploy SocialMarketingAI
  console.log("\n📱 Deploying SocialMarketingAI...");
  const SocialMarketingAI = await ethers.getContractFactory("SocialMarketingAI");
  const socialMarketingAI = await SocialMarketingAI.deploy(
    "SPARK Coupons",
    "SPARK",
    deployer.address, // Fee recipient
    trustMatrixScorerAddress // Trust matrix scorer
  );
  await socialMarketingAI.waitForDeployment();
  const socialMarketingAIAddress = await socialMarketingAI.getAddress();
  console.log("SocialMarketingAI deployed to:", socialMarketingAIAddress);

  // Deploy QuantumLendingPool
  console.log("\n💰 Deploying QuantumLendingPool...");
  const QuantumLendingPool = await ethers.getContractFactory("QuantumLendingPool");
  const quantumLendingPool = await QuantumLendingPool.deploy(
    KAIA_TESTNET_USDT, // USDT token address
    deployer.address, // Fee recipient
    trustMatrixScorerAddress // Trust matrix scorer
  );
  await quantumLendingPool.waitForDeployment();
  const quantumLendingPoolAddress = await quantumLendingPool.getAddress();
  console.log("QuantumLendingPool deployed to:", quantumLendingPoolAddress);

  // Using real USDT on Kaia testnet - no mock needed!

  console.log("\n✅ Deployment Summary:");
  console.log("========================");
  console.log("Network: Kaia Kairos Testnet");
  console.log("Deployer:", deployer.address);
  console.log("USDT Token:", KAIA_TESTNET_USDT);
  console.log("");
  console.log("Contract Addresses:");
  console.log("TrustMatrixScorer:", trustMatrixScorerAddress);
  console.log("KaiaSparkFactory:", kaiaSparkFactoryAddress);
  console.log("SocialMarketingAI:", socialMarketingAIAddress);
  console.log("QuantumLendingPool:", quantumLendingPoolAddress);
  console.log("USDT Token (Kaia):", KAIA_TESTNET_USDT);
  console.log("");
  console.log("🔗 Block Explorer: https://kairos.kaiaexplorer.io/");
  console.log("📋 Copy these addresses to your frontend configuration!");

  // Save deployment info
  const deploymentInfo = {
    network: "kaia-testnet",
    chainId: 1001,
    deployer: deployer.address,
    usdtToken: KAIA_TESTNET_USDT,
    contracts: {
      TrustMatrixScorer: trustMatrixScorerAddress,
      KaiaSparkFactory: kaiaSparkFactoryAddress,
      SocialMarketingAI: socialMarketingAIAddress,
      QuantumLendingPool: quantumLendingPoolAddress
    },
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
