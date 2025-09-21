import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG, ALTERNATIVE_RPC_URLS } from '../config/contracts';
import KaiaSparkFactoryABI from '../../artifacts/contracts/KaiaSparkFactory.sol/KaiaSparkFactory.json';

class Web3Service {


  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contracts: any = {};

  async connectWallet() {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      this.provider = new ethers.BrowserProvider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      
      // Get signer
      this.signer = await this.provider.getSigner();
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      console.log('Current network:', network);
      
      if (Number(network.chainId) !== NETWORK_CONFIG.chainId) {
        console.log('Switching to Kaia network...');
        await this.switchToKaiaNetwork();
      }
      
      // Test the connection with a simple call
      try {
        const address = await this.signer.getAddress();
        console.log('Connected to address:', address);
        
        // Try to get balance with retry logic
        const balance = await this.getAccountBalanceWithRetry();
        
        return {
          address,
          balance
        };
      } catch (rpcError) {
        console.error('RPC connection error:', rpcError);
        throw new Error('Failed to connect to Kaia network. Please check your network connection and try again.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async switchToKaiaNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
            chainName: NETWORK_CONFIG.chainName,
            rpcUrls: [NETWORK_CONFIG.rpcUrl],
            blockExplorerUrls: [NETWORK_CONFIG.blockExplorer],
            nativeCurrency: NETWORK_CONFIG.nativeCurrency,
          }],
        });
      } else {
        throw switchError;
      }
    }
  }

  async getContract(contractName: string, abi: any) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    const address = CONTRACT_ADDRESSES[contractName as keyof typeof CONTRACT_ADDRESSES];
    if (!address) {
      throw new Error(`Contract address not found for ${contractName}`);
    }
    
    return new ethers.Contract(address, abi, this.signer);
  }

  async getAccountBalance() {
    if (!this.provider || !this.signer) {
      throw new Error('Wallet not connected');
    }
    
    const address = await this.signer.getAddress();
    const balance = await this.provider.getBalance(address);
    
    // Ensure proper BigNumber handling
    const formattedBalance = ethers.formatEther(balance.toString());
    return formattedBalance;
  }

  // Retry logic for RPC calls
  async getAccountBalanceWithRetry(maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        if (!this.provider || !this.signer) {
          throw new Error('Wallet not connected');
        }
        
        const address = await this.signer.getAddress();
        const balance = await this.provider.getBalance(address);
        
        // Ensure proper BigNumber handling
        const formattedBalance = ethers.formatEther(balance.toString());
        return formattedBalance;
      } catch (error: any) {
        console.warn(`Balance fetch attempt ${i + 1} failed:`, error.message);
        
        if (i === maxRetries - 1) {
          // Last attempt failed, return 0
          console.error('All balance fetch attempts failed, returning 0');
          return '0';
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return '0';
  }

  async getUSDTBalance() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // On Kaia testnet, we'll use KAIA tokens for payments instead of USDT
      // Return the KAIA balance converted to "USDT equivalent" for UI consistency
      const kaiaBalance = await this.getAccountBalance();
      // Use a more reasonable conversion rate: 1 KAIA = 1 USDT for demo
      const kaiaAsUsdt = parseFloat(kaiaBalance).toFixed(2);
      return kaiaAsUsdt;
    } catch (error) {
      console.warn('Failed to get KAIA balance as USDT equivalent:', error);
      return '0';
    }
  }

  async getKaiaPriceInUSD() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      // Try to fetch KAIA price from CoinGecko API
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kaia&vs_currencies=usd', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data.kaia && data.kaia.usd && data.kaia.usd > 0) {
          console.log('✅ KAIA price from API:', data.kaia.usd);
          return data.kaia.usd;
        }
      }
      
      // Fallback: Use a reasonable estimate for KAIA price
      // For testnet demo, use a realistic price
      console.log('⚠️ Using fallback KAIA price: $0.10');
      return 0.10; // $0.10 per KAIA as a more realistic testnet estimate
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.warn('Fetch timed out. Using fallback price.');
      } else {
        console.warn('Failed to fetch KAIA price:', error);
      }
      // Fallback price for testnet
      return 0.10;
    }
  }

  async getKaiaBalanceInUSD() {
    try {
      const kaiaBalance = await this.getAccountBalance();
      const kaiaPrice = await this.getKaiaPriceInUSD();
      
      // Ensure we handle the conversion properly
      const balanceNum = parseFloat(kaiaBalance || '0');
      const priceNum = parseFloat(kaiaPrice.toString());
      
      if (isNaN(balanceNum) || isNaN(priceNum)) {
        console.warn('Invalid balance or price values:', { balanceNum, priceNum });
        return '0.00';
      }
      
      const usdValue = balanceNum * priceNum;
      console.log(`💰 USD Calculation: ${balanceNum} KAIA × $${priceNum} = $${usdValue.toFixed(2)}`);
      
      return usdValue.toFixed(2);
    } catch (error) {
      console.warn('Failed to calculate KAIA USD value:', error);
      return '0.00';
    }
  }

  // Business functions
  async registerBusiness(businessData: {
    name: string;
    category: string;
    location: string;
    metadataURI?: string;
  }): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const factory = await this.getContract('KAIA_SPARK_FACTORY', KaiaSparkFactoryABI.abi);
      
      // Check if business is already registered using correct method name
      const ownerAddress = await this.signer.getAddress();
      try {
        const isRegistered = await factory.registeredBusinesses(ownerAddress);
        if (isRegistered) {
          throw new Error('Business already registered for this wallet address');
        }
        console.log('✅ Registration check passed - proceeding with registration');
      } catch (checkError: any) {
        if (checkError.message?.includes('Business already registered')) {
          throw checkError;
        }
        console.warn('Could not check registration status, proceeding with registration');
      }
      
      // Try to get registration fee, fallback to 0.01 KAIA if it fails
      let fee: bigint;
      try {
        fee = await factory.registrationFee();
        console.log('Registration fee from contract:', ethers.formatEther(fee), 'KAIA');
      } catch (error) {
        console.warn('Could not get registration fee, using default 0.01 KAIA');
        fee = ethers.parseEther('0.01'); // 0.01 KAIA as default
      }
      
      console.log('Registering business:', businessData.name);

      // Call contract directly, including the registration fee
      const tx = await factory.registerBusiness(
        businessData.name,
        businessData.category,
        businessData.location,
        businessData.metadataURI || `ipfs://business-${Date.now()}`,
        {
          value: fee,
          gasLimit: 500000
        }
      );
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt?.hash);
      
      return receipt?.hash || tx.hash;
    } catch (error: any) {
      console.error('Business registration failed:', error);
      
      // Check for specific error messages
      if (error.message?.includes('Business already registered') || 
          error.reason?.includes('Business already registered')) {
        throw new Error('Business already registered for this wallet address');
      }
      
      // Check for insufficient funds
      if (error.message?.includes('insufficient funds') || 
          error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient KAIA balance to pay registration fee');
      }
      
      // Check for user rejection
      if (error.code === 4001 || error.message?.includes('User denied')) {
        throw new Error('Transaction was rejected by user');
      }
      
      // Generic error
      throw new Error(`Registration failed: ${error.message || 'Unknown error'}`);
    }
  }

  async getBusinesses() {
    try {
      // Use direct provider connection instead of signer for read-only operations
      const provider = new ethers.JsonRpcProvider('https://public-en-kairos.node.kaia.io');
      
      const factoryAbi = [
        "function getAllBusinesses(uint256 offset, uint256 limit) view returns (address[] memory businessOwners, tuple(address businessAddress, string name, string category, string location, address owner, bool isVerified, uint256 trustScore, uint256 totalVolume, uint256 createdAt, string metadataURI)[] memory profiles)",
        "function totalBusinesses() view returns (uint256)"
      ];
      
      const factory = new ethers.Contract(CONTRACT_ADDRESSES.KAIA_SPARK_FACTORY, factoryAbi, provider);
      
      console.log('🔍 Fetching businesses from blockchain...');
      
      // Get total count first
      const totalCount = await factory.totalBusinesses();
      const count = Number(totalCount);
      
      console.log('📊 Total businesses on blockchain:', count);
      
      if (count === 0) {
        console.log('⚠️ No businesses found on blockchain');
        return [];
      }
      
      // Get all businesses (limit to first 50 for performance)
      const limit = Math.min(count, 50);
      const result = await factory.getAllBusinesses(0, limit);
      const [businessOwners, profiles] = result;
      
      console.log('✅ Successfully fetched', profiles.length, 'businesses from blockchain');
      
      const businesses = profiles.map((profile: any, index: number) => ({
        id: profile.businessAddress,
        name: profile.name,
        category: profile.category || 'General',
        location: profile.location,
        owner: profile.owner,
        isVerified: profile.isVerified,
        trustScore: Number(profile.trustScore),
        totalVolume: Number(ethers.formatEther(profile.totalVolume.toString())),
        createdAt: new Date(Number(profile.createdAt) * 1000),
        metadataURI: profile.metadataURI
      }));
      
      console.log('🏪 Businesses loaded:', businesses.map(b => b.name).join(', '));
      
      return businesses;
    } catch (error: any) {
      console.error('❌ Failed to fetch businesses from contract:', error.message);
      console.error('Full error:', error);
      return []; // Return empty array if contracts not available
    }
  }

  // Campaign functions
  async createCampaign(title: string, description: string, maxCoupons: number, discountPercent: number) {
    const marketingAbi = [
      "function createCampaign(string memory title, string memory description, uint256 maxCoupons, uint256 discountPercent) external"
    ];
    
    const marketing = await this.getContract('SOCIAL_MARKETING_AI', marketingAbi);
    const tx = await marketing.createCampaign(title, description, maxCoupons, discountPercent);
    
    return await tx.wait();
  }

  async getCampaigns() {
    try {
      const marketingAbi = [
        "function getCampaigns() view returns (tuple(uint256 id, string title, string description, uint256 maxCoupons, uint256 claimedCoupons, uint256 discountPercent, address creator, bool isActive, uint256 createdAt)[])"
      ];
      
      const marketing = await this.getContract('SOCIAL_MARKETING_AI', marketingAbi);
      const campaigns = await marketing.getCampaigns();
      
      return campaigns.map((campaign: any) => ({
        id: Number(campaign.id),
        title: campaign.title,
        description: campaign.description,
        maxCoupons: Number(campaign.maxCoupons),
        claimedCoupons: Number(campaign.claimedCoupons),
        discountPercent: Number(campaign.discountPercent),
        creator: campaign.creator,
        isActive: campaign.isActive,
        createdAt: new Date(Number(campaign.createdAt) * 1000)
      }));
    } catch (error: any) {
      console.warn('Smart contract not deployed or network issue:', error.message);
      return []; // Return empty array if contracts not available
    }
  }

  async claimCoupon(campaignId: number) {
    const marketingAbi = [
      "function claimCoupon(uint256 campaignId) external"
    ];
    
    const marketing = await this.getContract('SOCIAL_MARKETING_AI', marketingAbi);
    const tx = await marketing.claimCoupon(campaignId);
    
    return await tx.wait();
  }

  // Lending functions
  async investInPool(amount: string) {
    const lendingAbi = [
      "function investInPool(uint256 amount) external"
    ];
    
    const lending = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    const tx = await lending.investInPool(ethers.parseEther(amount));
    
    return await tx.wait();
  }

  async investInLoan(loanId: number, amount: string): Promise<string> {
    const lendingAbi = [
      "function investInLoan(uint256 loanId, uint256 amount) external",
    ];
    const contract = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    const parsedAmount = ethers.parseUnits(amount, 6); // Assuming 6 decimals
    const tx = await contract.investInLoan(loanId, parsedAmount);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async applyForLoan(data: {
    amount: number;
    purpose: string;
    dailyRepaymentPercentage: number;
  }): Promise<void> {
    const lendingAbi = [
      "function applyForLoan(uint256 amount, string memory purpose, uint256 dailyRepaymentPercentage) external",
    ];
    const contract = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    // Ensure we pass the amount in smallest units (e.g., 6 decimals for USDT)
    const parsedAmount = ethers.parseUnits(data.amount.toString(), 6);
    const tx = await contract.applyForLoan(
      parsedAmount,
      data.purpose,
      data.dailyRepaymentPercentage
    );
    await tx.wait();
  }

  async repayLoan(loanId: number, amount: string): Promise<string> {
    const lendingAbi = ["function repayLoan(uint256 loanId, uint256 amount) external"];
    const contract = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    const parsedAmount = ethers.parseUnits(amount, 6);
    const tx = await contract.repayLoan(loanId, parsedAmount);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getInvestorLoans(investor: string): Promise<number[]> {
    const lendingAbi = ["function getInvestorLoans(address investor) view returns (uint256[] memory)"];
    const contract = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    const loanIds = await contract.getInvestorLoans(investor);
    return loanIds.map((id: bigint) => Number(id));
  }

  async getBorrowerLoans(borrower: string): Promise<number[]> {
    const lendingAbi = ["function getBorrowerLoans(address borrower) view returns (uint256[] memory)"];
    const contract = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    const loanIds = await contract.getBorrowerLoans(borrower);
    return loanIds.map((id: bigint) => Number(id));
  }

  async getPendingLoans(): Promise<any[]> {
    const lendingAbi = [
      "function nextLoanId() view returns (uint256)",
      "function getLoanDetails(uint256 loanId) view returns (tuple(uint256 id, address borrower, uint256 amount, uint256 interestRate, uint256 duration, string purpose, string description, uint256 status))",
    ];
    const contract = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    const nextLoanId = await contract.nextLoanId();
    const count = Number(nextLoanId) - 1;
    const pending = [];
    for (let i = 1; i <= count; i++) {
      const details = await contract.getLoanDetails(i);
      if (Number(details.status) === 0) { // Pending
        pending.push({
          id: Number(details.id),
          borrower: details.borrower,
          amount: ethers.formatUnits(details.amount, 6),
          interestRate: Number(details.interestRate),
          duration: Number(details.duration),
          purpose: details.purpose,
          description: details.description
        });
      }
    }
    return pending;
  }

  async getLoanDetails(loanId: number): Promise<any> {
    const lendingAbi = ["function getLoanDetails(uint256 loanId) view returns (tuple(uint256 id, address borrower, uint256 amount, uint256 interestRate, uint256 duration, string purpose, string description, uint256 status))"];
    const contract = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    return contract.getLoanDetails(loanId);
  }

  async getPoolStats(): Promise<any> {
    const lendingAbi = ["function getPoolStats() view returns (uint256, uint256, uint256)"];
    const contract = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    const [totalInvested, totalRepaid, totalInterest] = await contract.getPoolStats();
    return {
      totalInvested: ethers.formatUnits(totalInvested, 6),
      totalRepaid: ethers.formatUnits(totalRepaid, 6),
      totalInterest: ethers.formatUnits(totalInterest, 6),
    };
  }

  async getUserInvestments(user: string): Promise<any> {
    const lendingAbi = ["function getUserInvestments(address user) view returns (uint256, uint256)"];
    const contract = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    const [totalInvested, totalClaimed] = await contract.getUserInvestments(user);
    return {
      totalInvested: ethers.formatUnits(totalInvested, 6),
      totalClaimed: ethers.formatUnits(totalClaimed, 6),
    };
  }

  async getPoolInfo(): Promise<any> {
    const lendingAbi = ["function poolMetrics() view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256)"];
    const contract = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    const metrics = await contract.poolMetrics();
    return {
      totalLoans: Number(metrics[0]),
      activeLoans: Number(metrics[1]),
      totalInvestments: Number(metrics[2]),
      totalLent: ethers.formatUnits(metrics[3], 6),
      totalRepaid: ethers.formatUnits(metrics[4], 6),
      totalDefaulted: ethers.formatUnits(metrics[5], 6),
      averageInterestRate: Number(metrics[6]),
      totalInvestors: Number(metrics[7]),
    };
  }

  async recordSocialInteraction(to: string, interactionType: number, value: number, description: string, isPositive: boolean): Promise<string> {
        const trustAbi = ["function recordSocialInteraction(address to, uint256 interactionType, uint256 value, string calldata description, bool isPositive) external"];
        const contract = await this.getContract('TRUST_MATRIX_SCORER', trustAbi);
        const tx = await contract.recordSocialInteraction(to, interactionType, value, description, isPositive);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getTrustProfile(user: string): Promise<any> {
    const trustAbi = ["function trustProfiles(address) view returns (address, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool, string)"];
    const contract = await this.getContract('TRUST_MATRIX_SCORER', trustAbi);
    const profile = await contract.trustProfiles(user);
    return {
      user: profile[0],
      trustScore: Number(profile[1]),
      socialInteractions: Number(profile[2]),
      successfulTransactions: Number(profile[3]),
      failedTransactions: Number(profile[4]),
      referralsGiven: Number(profile[5]),
      referralsReceived: Number(profile[6]),
      lastActivity: new Date(Number(profile[7]) * 1000),
      createdAt: new Date(Number(profile[8]) * 1000),
      isVerified: profile[9],
      metadataURI: profile[10],
    };
  }

  async calculateTrustScore(user: string): Promise<number> {
    const trustAbi = ["function calculateTrustScore(address user) external returns (uint256)"];
    const contract = await this.getContract('TRUST_MATRIX_SCORER', trustAbi);
    const tx = await contract.calculateTrustScore(user);
    const receipt = await tx.wait();
    // You might need to parse logs to get the updated score, or have the contract return it.
    // For now, let's refetch the profile
    const profile = await this.getTrustProfile(user);
    return profile.trustScore;
  }

  async registerUserForTrustScoring(metadataURI: string): Promise<string> {
    const trustAbi = ["function registerUser(string memory metadataURI) external"];
    const contract = await this.getContract('TRUST_MATRIX_SCORER', trustAbi);
    const tx = await contract.registerUser(metadataURI);
    const receipt = await tx.wait();
    return receipt.hash;
  }
}

export const web3Service = new Web3Service();
