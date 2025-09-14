import React, { useState } from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import type { AppContext } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockDeals } from '@/data/mockData';
import { NftCard } from '@/components/NftCard';
import { CouponCard } from '@/components/CouponCard';

const ProfilePage: React.FC = () => {
  const { isLoggedIn, walletAddress, walletBalance, walletUsdBalance, logout } = useOutletContext<AppContext>();
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
            <img src={`https://avatars.dicebear.com/api/jdenticon/${walletAddress}.svg`} alt="User Avatar" className="w-24 h-24 rounded-full bg-gray-800 border-2 border-purple-700" />
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
                <div className="text-2xl font-bold text-white">{walletBalance.toFixed(4)} KAIA</div>
                <div className="text-sm text-purple-400">≈ ${walletUsdBalance.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button onClick={logout} className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300 text-gray-300 font-semibold px-6 py-2 rounded-lg">Logout</Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-tech font-bold text-white text-glow mb-4">My NFT Coupons</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockDeals.filter(deal => deal.nftCoupon).map(coupon => <CouponCard key={coupon.id} coupon={coupon} />)}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-tech font-bold text-white text-glow mb-4">My NFT Collection</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockDeals.filter(deal => !deal.nftCoupon).map(nft => <NftCard key={nft.id} nft={nft} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
