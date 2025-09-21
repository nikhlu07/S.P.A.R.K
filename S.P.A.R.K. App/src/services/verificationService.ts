// Business Verification Service
class VerificationService {
  
  // Check if a business is verified (from localStorage for demo)
  isBusinessVerified(walletAddress: string): boolean {
    if (!walletAddress) return false;
    return localStorage.getItem(`business_verified_${walletAddress}`) === 'true';
  }
  
  // Mark business as verified
  setBusinessVerified(walletAddress: string, verified: boolean = true): void {
    if (!walletAddress) return;
    
    if (verified) {
      localStorage.setItem(`business_verified_${walletAddress}`, 'true');
      console.log('✅ Business marked as verified:', walletAddress);
    } else {
      localStorage.removeItem(`business_verified_${walletAddress}`);
      console.log('❌ Business verification removed:', walletAddress);
    }
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('businessVerificationChanged', {
      detail: { walletAddress, verified }
    }));
  }
  
  // Get verification status with additional info
  getVerificationInfo(walletAddress: string) {
    const isVerified = this.isBusinessVerified(walletAddress);
    const verifiedAt = localStorage.getItem(`business_verified_at_${walletAddress}`);
    
    return {
      isVerified,
      verifiedAt: verifiedAt ? new Date(verifiedAt) : null,
      status: isVerified ? 'Verified' : 'Not Verified',
      statusColor: isVerified ? 'text-green-400' : 'text-yellow-400'
    };
  }
  
  // Set verification timestamp
  setVerificationTimestamp(walletAddress: string): void {
    if (!walletAddress) return;
    localStorage.setItem(`business_verified_at_${walletAddress}`, new Date().toISOString());
  }
  
  // Clear all verification data (for testing)
  clearAllVerifications(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('business_verified_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🧹 All verification data cleared');
  }
}

export const verificationService = new VerificationService();