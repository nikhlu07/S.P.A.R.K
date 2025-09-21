import React, { useState } from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import type { AppContext } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NftCard } from '@/components/NftCard';
import { CouponCard } from '@/components/CouponCard';
import { useWeb3 } from '@/contexts/Web3Context';

const ProfilePage: React.FC = () => {
  const { isLoggedIn, walletAddress, walletBalance, walletUsdBalance, logout } = useOutletContext<AppContext>();
  const { 
    isConnected, 
    account, 
    balance, 
    usdtBalance, 
    campaigns, 
    businesses,
    lineProfile,
    isLineConnected 
  } = useWeb3();
  const [username, setUsername] = useState('Neural-Agent-007');
  const [isEditing, setIsEditing] = useState(false);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const handleUpdateUsername = () => {
    // In a real app, you would save this to a backend.
    setIsEditing(false);
    alert('Username updated!');
  };

  return (
    <div className="space-y-8">
      <div className="card-border-glow p-8 rounded-lg animation-none">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <img 
              src={`https://avatars.dicebear.com/api/jdenticon/${walletAddress}.svg`} 
              alt="User Avatar" 
              className="w-24 h-24 rounded-full bg-gray-800 border-2 border-purple-700"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-avatar.svg";
              }}
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input value={username} onChange={(e) => setUsername(e.target.value)} className="max-w-xs bg-black/20 border-purple-500/30" />
                <Button onClick={handleUpdateUsername} className="glow-button">Save</Button>
                <Button onClick={() => setIsEditing(false)} variant="ghost">Cancel</Button>
              </div>
            ) : (
              <h1 className="font-tech text-3xl font-bold text-white text-glow flex items-center gap-4">{username} <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">Edit</Button></h1>
            )}
            <p className="mt-2 text-gray-400 truncate">{walletAddress}</p>
            <div className="mt-4 flex items-center justify-center md:justify-start gap-6 font-tech">
              <div>
                <div className="text-2xl font-bold text-white">{isConnected ? parseFloat(balance || '0').toFixed(4) : walletBalance.toFixed(4)} KAIA</div>
                <div className="text-sm text-purple-400">≈ ${isConnected ? parseFloat(usdtBalance || '0').toFixed(2) : walletUsdBalance.toFixed(2)}</div>
              </div>
              {isConnected && (
                <div>
                  <div className="text-lg font-bold text-green-400">{parseFloat(usdtBalance || '0').toFixed(2)} USDT</div>
                  <div className="text-sm text-gray-400">Blockchain Balance</div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button onClick={logout} className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300 text-gray-300 font-semibold px-6 py-2 rounded-lg">Logout</Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Real Campaign Data */}
        {isConnected && campaigns.length > 0 && (
          <div>
            <h2 className="text-2xl font-tech font-bold text-white text-glow mb-4">My Active Campaigns</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {campaigns.map(campaign => (
                <div key={campaign.campaignId} className="card-border-glow p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">{campaign.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{campaign.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-400">Claimed: {campaign.claimedCoupons}</span>
                    <span className="text-green-400">{campaign.discountPercentage}% off</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {campaign.isActive ? 'Active' : 'Inactive'} • {campaign.isViral ? 'Viral' : 'Standard'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Support */}
        {isConnected && businesses.length > 0 && (
          <div>
            <h2 className="text-2xl font-tech font-bold text-white text-glow mb-4">Businesses I Support</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {businesses.map(business => (
                <div key={business.businessAddress} className="card-border-glow p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">{business.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{business.category}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-400">Trust: {business.trustScore}/100</span>
                    <span className="text-green-400">Volume: {business.totalVolume} USDT</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {business.isVerified ? 'Verified' : 'Unverified'} • {business.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LINE Profile */}
        {isLineConnected && lineProfile && (
          <div>
            <h2 className="text-2xl font-tech font-bold text-white text-glow mb-4">LINE Profile</h2>
            <div className="card-border-glow p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <img 
                  src={lineProfile.pictureUrl} 
                  alt="LINE Profile" 
                  className="w-16 h-16 rounded-full object-cover object-center"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
                <div>
                  <h3 className="font-bold text-white">{lineProfile.displayName}</h3>
                  <p className="text-gray-400 text-sm">Connected to LINE</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback for when not connected */}
        {!isConnected && (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Connect your wallet to see your blockchain data</p>
            <Button className="glow-button">Connect Wallet</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
