import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/contracts';

class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contracts: any = {};

  async connectWallet() {
    try {
      // Request account access
      this.provider = new ethers.BrowserProvider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      
      // Get signer
      this.signer = await this.provider.getSigner();
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== NETWORK_CONFIG.chainId) {
        await this.switchToKaiaNetwork();
      }
      
      return {
        address: await this.signer.getAddress(),
        balance: await this.provider.getBalance(await this.signer.getAddress())
      };
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
    return ethers.formatEther(balance);
  }

  async getUSDTBalance() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    // USDT has 6 decimals
    const usdtAbi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    
    const usdtContract = await this.getContract('USDT_TOKEN', usdtAbi);
    const balance = await usdtContract.balanceOf(await this.signer.getAddress());
    const decimals = await usdtContract.decimals();
    
    return ethers.formatUnits(balance, decimals);
  }

  // Business functions
  async registerBusiness(name: string, description: string, category: string, location: string) {
    const factoryAbi = [
      "function registerBusiness(string memory name, string memory description, string memory category, string memory location) external payable",
      "function registrationFee() view returns (uint256)"
    ];
    
    const factory = await this.getContract('KAIA_SPARK_FACTORY', factoryAbi);
    const fee = await factory.registrationFee();
    
    const tx = await factory.registerBusiness(name, description, category, location, {
      value: fee
    });
    
    return await tx.wait();
  }

  async getBusinesses() {
    const factoryAbi = [
      "function getBusinesses() view returns (tuple(address businessAddress, string name, string category, string location, address owner, bool isVerified, uint256 trustScore, uint256 totalVolume, uint256 createdAt, string metadataURI)[])",
      "function getBusinessCount() view returns (uint256)"
    ];
    
    const factory = await this.getContract('KAIA_SPARK_FACTORY', factoryAbi);
    const businesses = await factory.getBusinesses();
    
    return businesses.map((biz: any) => ({
      id: biz.businessAddress,
      name: biz.name,
      category: biz.category,
      location: biz.location,
      owner: biz.owner,
      isVerified: biz.isVerified,
      trustScore: Number(biz.trustScore),
      totalVolume: Number(ethers.formatEther(biz.totalVolume)),
      createdAt: new Date(Number(biz.createdAt) * 1000),
      metadataURI: biz.metadataURI
    }));
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

  async getPoolInfo() {
    const lendingAbi = [
      "function getPoolInfo() view returns (uint256 totalInvested, uint256 totalBorrowed, uint256 availableLiquidity, uint256 totalInvestors)"
    ];
    
    const lending = await this.getContract('QUANTUM_LENDING_POOL', lendingAbi);
    const poolInfo = await lending.getPoolInfo();
    
    return {
      totalInvested: Number(ethers.formatEther(poolInfo.totalInvested)),
      totalBorrowed: Number(ethers.formatEther(poolInfo.totalBorrowed)),
      availableLiquidity: Number(ethers.formatEther(poolInfo.availableLiquidity)),
      totalInvestors: Number(poolInfo.totalInvestors)
    };
  }
}

export const web3Service = new Web3Service();
