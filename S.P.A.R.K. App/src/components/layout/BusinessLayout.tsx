import React, { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import { ethers } from 'ethers';

const KAIA_TESTNET = {
  chainId: '0x3E9', // 1001
  chainName: 'Kaia Kairos Testnet',
  nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
  rpcUrls: ['https://public-en-kairos.node.kaia.io'],
  blockExplorerUrls: ['https://kairos.kaiaexplorer.io/'],
};

const BusinessLayout = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletUsdBalance, setWalletUsdBalance] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(KAIA_TESTNET.chainId)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: KAIA_TESTNET.chainId }],
          });
        } catch (switchError: unknown) {
          const error = switchError as { code?: number };
          if (error.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [KAIA_TESTNET],
            });
          } else {
            console.error("Failed to switch wallet:", error);
            alert("Failed to switch wallet. See console for more details.");
            return;
          }
        }
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      const formattedBalance = parseFloat(ethers.formatUnits(balance, 18));
      
      let kaiaUsdPrice = 0.15; // Default price
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kaia&vs_currencies=usd');
        if (!response.ok) {
          throw new Error('Failed to fetch price');
        }
        const data = await response.json();
        if (data.kaia && data.kaia.usd) {
          kaiaUsdPrice = data.kaia.usd;
        }
      } catch (priceError) {
        console.error("Could not fetch KAIA price, using default:", priceError);
      }

      setWalletAddress(address);
      setWalletBalance(formattedBalance);
      setWalletUsdBalance(formattedBalance * kaiaUsdPrice);
      setIsLoggedIn(true);

    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. See console for more details.");
    }
  };

  const logout = () => {
    setWalletAddress(null);
    setWalletBalance(0);
    setWalletUsdBalance(0);
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans relative antialiased">
      <div className="stars-container">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>
      <div id="mouse-glow"></div>
      <div className="scanline-overlay"></div>

      <div className="relative z-10">
        <Outlet context={{ walletAddress, walletBalance, walletUsdBalance, isLoggedIn, connectWallet, logout }} />
      </div>
    </div>
  );
};

export default BusinessLayout;
