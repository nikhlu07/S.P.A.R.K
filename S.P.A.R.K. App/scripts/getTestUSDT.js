const { ethers } = require("hardhat");

// Kaia Testnet (Kairos) USDT Token Address
const KAIA_TESTNET_USDT = "0x55d398326f99059fF775485246999027B3197955";

// USDT ABI (minimal for minting)
const USDT_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

async function main() {
  console.log("💰 Getting Test USDT on Kaia Testnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);
  
  // Connect to USDT contract
  const usdtContract = new ethers.Contract(KAIA_TESTNET_USDT, USDT_ABI, deployer);
  
  try {
    // Check current balance
    const balance = await usdtContract.balanceOf(deployer.address);
    const decimals = await usdtContract.decimals();
    const symbol = await usdtContract.symbol();
    const name = await usdtContract.name();
    
    console.log(`\n📊 Current ${symbol} Balance:`, ethers.formatUnits(balance, decimals));
    console.log(`Token Name: ${name}`);
    console.log(`Token Symbol: ${symbol}`);
    console.log(`Token Address: ${KAIA_TESTNET_USDT}`);
    
    if (balance > 0) {
      console.log("✅ You already have USDT tokens!");
    } else {
      console.log("❌ No USDT tokens found.");
      console.log("\n🔧 To get test USDT:");
      console.log("1. Visit Kaia testnet faucet");
      console.log("2. Or contact the hackathon organizers");
      console.log("3. Or use the mint function if you have permissions");
    }
    
  } catch (error) {
    console.error("❌ Error interacting with USDT contract:", error.message);
    console.log("\n💡 This might mean:");
    console.log("1. The USDT contract address is incorrect");
    console.log("2. You're not connected to Kaia testnet");
    console.log("3. The contract doesn't have a public mint function");
  }
  
  console.log("\n🌐 Kaia Testnet Info:");
  console.log("Network: Kaia Kairos Testnet");
  console.log("Chain ID: 10001 (0x2711)");
  console.log("RPC URL: https://public-en-kairos.node.kaia.io");
  console.log("Block Explorer: https://kairos.kaiaexplorer.io/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
