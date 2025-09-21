import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/contracts';

export interface PaymentRequest {
  to: string;
  amount: string;
  currency: 'KAIA' | 'USDT';
  dealId?: string;
  businessId?: string;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
}

export interface RewardClaim {
  userId: string;
  amount: string;
  token: string;
  reason: string;
}

class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  // Initialize the service with provider and signer
  async initialize() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
  }

  // Ensure we're connected to Kaia network
  async ensureKaiaNetwork(): Promise<boolean> {
    try {
      const network = await this.provider!.getNetwork();
      if (Number(network.chainId) !== NETWORK_CONFIG.chainId) {
        await this.switchToKaiaNetwork();
        return true;
      }
      return true;
    } catch (error) {
      console.error('Network switch failed:', error);
      return false;
    }
  }

  private async switchToKaiaNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
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
      }
    }
  }

  // Get contract instance for interaction
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

  // Send KAIA payment
  async sendKaiaPayment(payment: PaymentRequest): Promise<TransactionResult> {
    try {
      await this.ensureKaiaNetwork();

      const tx = await this.signer!.sendTransaction({
        to: payment.to,
        value: ethers.parseEther(payment.amount),
        gasLimit: 21000,
      });

      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt!.hash,
        gasUsed: receipt!.gasUsed.toString(),
      };
    } catch (error: any) {
      console.error('KAIA payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }
  }

  // Send USDT payment (requires USDT contract interaction)
  async sendUSDTPayment(payment: PaymentRequest): Promise<TransactionResult> {
    try {
      await this.ensureKaiaNetwork();

      // USDT contract ABI (minimal for transfer)
      const usdtAbi = [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];

      const usdtContract = new ethers.Contract(
        CONTRACT_ADDRESSES.USDT_TOKEN,
        usdtAbi,
        this.signer!
      );

      // Get USDT decimals (usually 18 for testnet)
      const decimals = await usdtContract.decimals();
      const amount = ethers.parseUnits(payment.amount, decimals);

      // Check balance
      const balance = await usdtContract.balanceOf(await this.signer!.getAddress());
      if (balance < amount) {
        return {
          success: false,
          error: 'Insufficient USDT balance',
        };
      }

      // Send transaction
      const tx = await usdtContract.transfer(payment.to, amount);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt!.hash,
        gasUsed: receipt!.gasUsed.toString(),
      };
    } catch (error: any) {
      console.error('USDT payment failed:', error);
      return {
        success: false,
        error: error.message || 'USDT payment failed',
      };
    }
  }

  // Claim deal with blockchain payment
  async claimDealWithPayment(
    dealId: string,
    businessAddress: string,
    amount: string,
    currency: 'KAIA' | 'USDT'
  ): Promise<TransactionResult> {
    try {
      let result: TransactionResult;

      if (currency === 'KAIA') {
        result = await this.sendKaiaPayment({
          to: businessAddress,
          amount,
          currency,
          dealId,
        });
      } else {
        result = await this.sendUSDTPayment({
          to: businessAddress,
          amount,
          currency,
          dealId,
        });
      }

      if (result.success) {
        // Record the transaction in our database
        await this.recordTransaction({
          dealId,
          businessAddress,
          amount,
          currency,
          txHash: result.txHash!,
          status: 'completed',
        });
      }

      return result;
    } catch (error: any) {
      console.error('Deal claim payment failed:', error);
      return {
        success: false,
        error: error.message || 'Deal claim failed',
      };
    }
  }

  // Claim coupon from marketing campaign
  async claimCoupon(campaignId: number): Promise<TransactionResult> {
    try {
      const marketingAbi = [
        "function claimCoupon(uint256 campaignId) external"
      ];
      
      const marketing = await this.getContract('SOCIAL_MARKETING_AI', marketingAbi);
      const tx = await marketing.claimCoupon(campaignId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error: any) {
      console.error('Coupon claim failed:', error);
      return {
        success: false,
        error: error.message || 'Coupon claim failed',
      };
    }
  }

  // Record transaction in database (you'll need to implement this)
  private async recordTransaction(transaction: {
    dealId: string;
    businessAddress: string;
    amount: string;
    currency: string;
    txHash: string;
    status: string;
  }) {
    // This would integrate with your Supabase service
    // For now, we'll just log it
    console.log('Transaction recorded:', transaction);
  }

  // Get transaction status
  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    gasUsed?: string;
  }> {
    try {
      const receipt = await this.provider!.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      if (receipt.status === 1) {
        return {
          status: 'confirmed',
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        };
      } else {
        return { status: 'failed' };
      }
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return { status: 'failed' };
    }
  }

  // Get user's token balances
  async getTokenBalances(userAddress: string): Promise<{
    kaia: string;
    usdt: string;
  }> {
    try {
      // Get KAIA balance
      const kaiaBalance = await this.provider!.getBalance(userAddress);
      const kaiaFormatted = ethers.formatEther(kaiaBalance.toString());

      // Get USDT balance
      const usdtAbi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];

      const usdtContract = new ethers.Contract(
        CONTRACT_ADDRESSES.USDT_TOKEN,
        usdtAbi,
        this.provider!
      );

      const usdtBalance = await usdtContract.balanceOf(userAddress);
      const decimals = await usdtContract.decimals();
      const usdtFormatted = ethers.formatUnits(usdtBalance.toString(), decimals);

      return {
        kaia: kaiaFormatted,
        usdt: usdtFormatted,
      };
    } catch (error) {
      console.error('Failed to get token balances:', error);
      return {
        kaia: '0',
        usdt: '0',
      };
    }
  }

  // Estimate gas for a transaction
  async estimateGas(to: string, value: string, data?: string): Promise<string> {
    try {
      const gasEstimate = await this.provider!.estimateGas({
        to,
        value: ethers.parseEther(value),
        data,
      });
      return gasEstimate.toString();
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return '21000'; // Default gas limit
    }
  }

  // Get current gas price
  async getGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider!.getFeeData();
      return feeData.gasPrice?.toString() || '0';
    } catch (error) {
      console.error('Failed to get gas price:', error);
      return '0';
    }
  }

  // Check if address is valid
  isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  // Format address for display
  formatAddress(address: string): string {
    if (!this.isValidAddress(address)) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Get network info
  async getNetworkInfo(): Promise<{
    chainId: number;
    chainName: string;
    blockNumber: number;
  }> {
    try {
      const network = await this.provider!.getNetwork();
      const blockNumber = await this.provider!.getBlockNumber();
      
      return {
        chainId: Number(network.chainId),
        chainName: network.name,
        blockNumber,
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw error;
    }
  }
}

export const blockchainService = new BlockchainService();

