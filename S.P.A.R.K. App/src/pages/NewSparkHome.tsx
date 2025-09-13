import React, { useState } from 'react';
import { Bell, Search, QrCode, Gift, Users, Zap, ArrowRight } from 'lucide-react';

// --- Mock Data ---
const user = {
  name: 'Alex',  // Let's give the user a name
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
};

const featuredDeals = [
  {
    id: 'deal1',
    business: 'Synth Cafe',
    title: '50% Off on All Coffees',
    logo: '☕',
  },
  {
    id: 'deal2',
    business: 'Data Pizza',
    title: 'Buy 1 Get 1 Free',
    logo: '🍕',
  },
  {
    id: 'deal3',
    business: 'Circuit Burgers',
    title: '$5 Burger Mondays',
    logo: '🍔',
  },
];

// --- UI Components ---

const Navbar = () => (
  <nav className="bg-white/10 backdrop-blur-lg p-4 flex justify-between items-center">
    <div className="flex items-center">
      <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
      <div className="ml-3">
        <p className="text-sm text-gray-400">Welcome back,</p>
        <h2 className="text-lg font-bold text-white">{user.name}</h2>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <Search className="text-white" />
      <Bell className="text-white" />
    </div>
  </nav>
);

const HeroSection = () => (
  <div className="p-6 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl m-4 text-white shadow-lg">
    <p className="text-sm opacity-80">Your Balance</p>
    <h1 className="text-4xl font-bold my-2">$1,234.56</h1>
    <div className="flex gap-4 mt-4">
      <button className="bg-white text-purple-600 font-bold py-2 px-4 rounded-full flex-1">Add Funds</button>
      <button className="bg-white/30 text-white font-bold py-2 px-4 rounded-full flex-1">Withdraw</button>
    </div>
  </div>
);

const TabNavigation = () => (
  <div className="flex justify-around p-4">
    <button className="flex flex-col items-center gap-1 text-white">
      <div className="p-3 bg-purple-500/30 rounded-full">
        <Zap className="w-6 h-6 text-purple-300" />
      </div>
      <span className="text-sm font-semibold">Deals</span>
    </button>
    <button className="flex flex-col items-center gap-1 text-gray-400">
      <div className="p-3 bg-gray-700/50 rounded-full">
        <Gift className="w-6 h-6" />
      </div>
      <span className="text-sm">Rewards</span>
    </button>
    <button className="flex flex-col items-center gap-1 text-gray-400">
      <div className="p-3 bg-gray-700/50 rounded-full">
        <Users className="w-6 h-6" />
      </div>
      <span className="text-sm">Community</span>
    </button>
  </div>
);

const FeaturedDeals = () => (
  <div className="px-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold text-white">Featured Deals</h3>
      <a href="#" className="text-sm text-purple-400 font-semibold flex items-center gap-1">
        View All <ArrowRight className="w-4 h-4" />
      </a>
    </div>
    <div className="space-y-3">
      {featuredDeals.map(deal => (
        <div key={deal.id} className="bg-white/10 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl mr-4">{deal.logo}</div>
            <div>
              <p className="font-bold text-white">{deal.title}</p>
              <p className="text-sm text-gray-400">{deal.business}</p>
            </div>
          </div>
          <button className="bg-purple-500 text-white font-bold text-sm py-1 px-3 rounded-full">Claim</button>
        </div>
      ))}
    </div>
  </div>
);

const ScanButton = () => (
    <div className="fixed bottom-6 right-6">
        <button className="bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <QrCode className="w-8 h-8" />
        </button>
    </div>
);

const NewSparkHome = () => {
  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Navbar />
      <HeroSection />
      <TabNavigation />
      <FeaturedDeals />
      <ScanButton />
    </div>
  );
};

export default NewSparkHome;
