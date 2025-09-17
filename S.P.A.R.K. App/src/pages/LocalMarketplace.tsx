import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Heart, 
  Share2, 
  ShoppingBag,
  TrendingUp,
  Clock,
  Users,
  Zap
} from "lucide-react";
import { useWeb3 } from '@/contexts/Web3Context';
import { DealDialog } from '@/components/DealDialog';

interface BusinessWithDeals {
  businessAddress: string;
  name: string;
  category: string;
  location: string;
  owner: string;
  isVerified: boolean;
  trustScore: number;
  totalVolume: number;
  image: string;
  rating: number;
  friendsLove: number;
  activeDeals: number;
  distance?: number;
}

const LocalMarketplace = () => {
  const { 
    isConnected, 
    businesses, 
    campaigns 
  } = useWeb3();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('trending');
  const [businessesWithDeals, setBusinessesWithDeals] = useState<BusinessWithDeals[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categories = [
    'All', 'Food & Drink', 'Retail', 'Services', 'Entertainment', 
    'Health & Beauty', 'Automotive', 'Technology', 'Education'
  ];

  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'distance', label: 'Distance' },
    { value: 'rating', label: 'Rating' },
    { value: 'trust', label: 'Trust Score' },
    { value: 'volume', label: 'Transaction Volume' }
  ];

  useEffect(() => {
    if (isConnected && businesses.length > 0) {
      // Enhance business data with deals and additional info
      const enhancedBusinesses = businesses.map(business => {
        const businessCampaigns = campaigns.filter(c => c.businessOwner === business.businessAddress);
        const activeDeals = businessCampaigns.filter(c => c.isActive).length;
        
        return {
          ...business,
          image: `https://images.unsplash.com/photo-${1500000000000 + Math.random() * 1000000000}?w=400&h=300&fit=crop`,
          rating: 4.0 + Math.random() * 1.0, // Random rating between 4.0-5.0
          friendsLove: Math.floor(Math.random() * 50) + 10, // Random friends count
          activeDeals,
          distance: Math.floor(Math.random() * 10) + 1 // Random distance in km
        };
      });
      
      setBusinessesWithDeals(enhancedBusinesses);
    } else {
      // Mock data for demo
      const mockBusinesses: BusinessWithDeals[] = [
        {
          businessAddress: '0x123...abc',
          name: 'Sharma Tea Stall',
          category: 'Food & Drink',
          location: 'Hazratganj, Lucknow',
          owner: '0x456...def',
          isVerified: true,
          trustScore: 85,
          totalVolume: 1250,
          image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
          rating: 4.8,
          friendsLove: 15,
          activeDeals: 3,
          distance: 0.5
        },
        {
          businessAddress: '0x789...ghi',
          name: 'Tech Gadgets Hub',
          category: 'Technology',
          location: 'Gomti Nagar, Lucknow',
          owner: '0x012...jkl',
          isVerified: true,
          trustScore: 92,
          totalVolume: 3200,
          image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          rating: 4.6,
          friendsLove: 28,
          activeDeals: 5,
          distance: 2.1
        },
        {
          businessAddress: '0x345...mno',
          name: 'Fashion Boutique',
          category: 'Retail',
          location: 'Aminabad, Lucknow',
          owner: '0x678...pqr',
          isVerified: false,
          trustScore: 78,
          totalVolume: 890,
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
          rating: 4.4,
          friendsLove: 12,
          activeDeals: 2,
          distance: 1.8
        }
      ];
      setBusinessesWithDeals(mockBusinesses);
    }
  }, [isConnected, businesses, campaigns]);

  const filteredBusinesses = businessesWithDeals.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || business.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
      case 'rating':
        return b.rating - a.rating;
      case 'trust':
        return b.trustScore - a.trustScore;
      case 'volume':
        return b.totalVolume - a.totalVolume;
      case 'trending':
      default:
        return b.activeDeals - a.activeDeals;
    }
  });

  const handleViewDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDealId(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-tech text-4xl font-bold text-white text-glow mb-4">
            🏪 Local Marketplace
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover and support local businesses in your community. 
            Pay with USDT, earn rewards, and help local entrepreneurs grow.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search businesses, categories, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-border-glow p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-400">{sortedBusinesses.length}</div>
            <div className="text-sm text-gray-400">Businesses</div>
          </div>
          <div className="card-border-glow p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">
              {sortedBusinesses.reduce((sum, b) => sum + b.activeDeals, 0)}
            </div>
            <div className="text-sm text-gray-400">Active Deals</div>
          </div>
          <div className="card-border-glow p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">
              {sortedBusinesses.filter(b => b.isVerified).length}
            </div>
            <div className="text-sm text-gray-400">Verified</div>
          </div>
          <div className="card-border-glow p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.round(sortedBusinesses.reduce((sum, b) => sum + b.trustScore, 0) / sortedBusinesses.length) || 0}
            </div>
            <div className="text-sm text-gray-400">Avg Trust Score</div>
          </div>
        </div>

        {/* Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBusinesses.map((business) => (
            <Card key={business.businessAddress} className="overflow-hidden flex flex-col bg-gray-900/50 card-border-glow animation-none">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-glow flex items-center gap-2">
                      {business.name}
                      {business.isVerified && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/50">
                          ✓ Verified
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-purple-400 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {business.location}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {business.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <img 
                  src={business.image} 
                  alt={business.name}
                  className="rounded-lg mb-4 w-full h-48 object-cover"
                />
                
                {/* Business Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{business.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Heart className="w-4 h-4" />
                      <span>{business.friendsLove} friends love this</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Trust Score:</span>
                    <span className="text-purple-400 font-bold">{business.trustScore}/100</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Volume:</span>
                    <span className="text-green-400 font-bold">{business.totalVolume} USDT</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Active Deals:</span>
                    <span className="text-blue-400 font-bold">{business.activeDeals}</span>
                  </div>
                  
                  {business.distance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Distance:</span>
                      <span className="text-orange-400 font-bold">{business.distance} km</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex gap-2">
                <Button 
                  variant="cyber" 
                  className="flex-1"
                  onClick={() => handleViewDeal(business.businessAddress)}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  View Deals
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedBusinesses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search terms or filters
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              variant="cyber"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <DealDialog
        dealId={selectedDealId}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default LocalMarketplace;
