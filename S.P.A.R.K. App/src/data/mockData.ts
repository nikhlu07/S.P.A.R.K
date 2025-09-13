// Mock data for SPARK social commerce platform

export const mockBusinesses = [
  {
    id: "sharma-tea",
    name: "Sharma Tea Stall",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    category: "Beverages",
    distance: "50m",
    rating: 4.8,
    friendsLove: 15,
  },
  {
    id: "gupta-books",
    name: "Gupta Book Store",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    category: "Books",
    distance: "120m",
    rating: 4.6,
    friendsLove: 8,
  },
  {
    id: "royal-sweets",
    name: "Royal Sweets Corner",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400",
    category: "Sweets",
    distance: "200m",
    rating: 4.9,
    friendsLove: 23,
  },
  {
    id: "city-tailors",
    name: "City Tailors",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400",
    category: "Fashion",
    distance: "80m",
    rating: 4.5,
    friendsLove: 6,
  },
];

export const mockDeals = [
  {
    id: "chai-samosa-combo",
    businessId: "sharma-tea",
    title: "Free Samosa with Chai",
    description: "Get a complimentary samosa with every chai purchase. Perfect evening snack combo!",
    discount: "20%",
    validUntil: "Today 8 PM",
    nftCoupon: true,
    trending: true,
  },
  {
    id: "book-lover-discount",
    businessId: "gupta-books",
    title: "Student Special Discount",
    description: "Show your student ID and get amazing discounts on all academic books and novels.",
    discount: "30%",
    validUntil: "Dec 31",
    nftCoupon: false,
    trending: false,
  },
  {
    id: "sweet-festival-pack",
    businessId: "royal-sweets",
    title: "Festival Sweet Box",
    description: "Specially curated sweet box with traditional favorites. Perfect for celebrations!",
    discount: "25%",
    validUntil: "This Week",
    nftCoupon: true,
    trending: true,
  },
  {
    id: "tailor-winter-offer",
    businessId: "city-tailors",
    title: "Winter Alteration Special",
    description: "Get your winter clothes perfectly fitted. Free minor alterations on new purchases.",
    discount: "15%",
    validUntil: "Jan 15",
    nftCoupon: false,
    trending: false,
  },
];

export const mockRewardTokens = [
  {
    name: "ChaiCoin",
    symbol: "CHAI",
    balance: 150,
    business: "Sharma Tea Stall",
    color: "#8B4513",
    trend: "up" as const,
    trendValue: 25,
  },
  {
    name: "BookCoin",
    symbol: "BOOK",
    balance: 45,
    business: "Gupta Book Store",
    color: "#4A90E2",
    trend: "up" as const,
    trendValue: 12,
  },
  {
    name: "SweetCoin",
    symbol: "SWEET",
    balance: 89,
    business: "Royal Sweets",
    color: "#F5A623",
    trend: "up" as const,
    trendValue: 18,
  },
];

export const mockLeaderboard = [
  {
    rank: 1,
    name: "Rajesh Kumar",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    achievement: "Supporting 15 local shops this month",
    score: 2847,
    badge: "Community Champion",
  },
  {
    rank: 2,
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b6e0d7b8?w=100",
    achievement: "847 ChaiCoins earned",
    score: 2156,
    badge: "Chai Lover",
  },
  {
    rank: 3,
    name: "Amit Patel",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    achievement: "12 businesses discovered",
    score: 1923,
    badge: "Explorer",
  },
  {
    rank: 4,
    name: "Sunita Gupta",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    achievement: "5 friends referred",
    score: 1687,
    badge: "Social Star",
  },
  {
    rank: 5,
    name: "Rohit Singh",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    achievement: "Top reviewer of the month",
    score: 1432,
    badge: "Reviewer",
  },
];

export const mockUserStats = {
  totalSpent: 12847,
  businessesSupported: 23,
  friendsReferred: 8,
  tokensEarned: 1247,
  nftCouponsCollected: 15,
  communityRank: 12,
};

export const mockCommunityStats = {
  totalUsers: 15000,
  activeBusinesses: 450,
  monthlyVolume: 25000000, // in INR
  communityPool: 1200000, // in INR
  loansActive: 23,
  averageYield: 8.5, // percentage
};