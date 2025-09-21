export const mockBusinesses = [
  {
    id: "1",
    name: "Pizza Place",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    category: "Food",
    distance: "150m",
    rating: 4.5,
    friendsLove: 12,
    location: "Mumbai, India",
    owner: "Rajesh Kumar"
  },
  {
    id: "2",
    name: "Coffee Corner",
    image: "https://images.unsplash.com/photo-1511920183353-3c9c95275a53?w=400",
    category: "Beverages",
    distance: "250m",
    rating: 4.7,
    friendsLove: 25,
    location: "Delhi, India",
    owner: "Priya Singh"
  },
  {
    id: "3",
    name: "Tech World",
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400",
    category: "Electronics",
    distance: "1km",
    rating: 4.9,
    friendsLove: 50,
    location: "Bangalore, India",
    owner: "Amit Patel"
  },
  {
    id: "4",
    name: "Style Hub",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    category: "Apparel",
    distance: "500m",
    rating: 4.6,
    friendsLove: 18,
    location: "Mumbai, India",
    owner: "Sunita Gupta"
  },
  {
    id: "5",
    name: "Gourmet Garden",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    category: "Food",
    distance: "750m",
    rating: 4.8,
    friendsLove: 32,
    location: "Pune, India",
    owner: "Vikram Singh"
  },
  {
    id: "6",
    name: "Readers Nook",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    category: "Books",
    distance: "300m",
    rating: 4.7,
    friendsLove: 22,
    location: "Kolkata, India",
    owner: "Anjali Sharma"
  }
];

export const mockDeals = [
  {
    id: '1',
    businessId: '1',
    title: '50% Off All Pizzas',
    description: 'Enjoy a flat 50% discount on all pizza varieties. Limited time offer!',
    discount: '50%',
    category: 'Food',
    endDate: '2024-12-31',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    nftCoupon: true,
    trending: true,
  },
  {
    id: '2',
    businessId: '2',
    title: 'BOGO on Coffee',
    description: 'Buy any coffee and get another one absolutely free. Perfect for sharing!',
    discount: 'BOGO',
    category: 'Beverages',
    endDate: '2024-11-30',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    nftCoupon: false,
    trending: true,
  },
  {
    id: '3',
    businessId: '3',
    title: '20% Off Electronics',
    description: 'Get a 20% discount on a wide range of electronics. Upgrade your gadgets now!',
    discount: '20%',
    category: 'Electronics',
    endDate: '2024-12-15',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop',
    nftCoupon: true,
    trending: false,
  },
  {
    id: '4',
    businessId: '4',
    title: '30% Off Fashion',
    description: 'Update your wardrobe with the latest trends and get 30% off.',
    discount: '30%',
    category: 'Apparel',
    endDate: '2024-11-25',
    image: 'https://images.unsplash.com/photo-1511920183353-3c9c95275a53?w=400',
    nftCoupon: false,
    trending: false,
  },
  {
    id: '5',
    businessId: '5',
    title: 'Free Dessert with Meal',
    description: 'Enjoy a complimentary dessert with every main course ordered.',
    discount: 'Free',
    category: 'Food',
    endDate: '2024-12-01',
    image: 'https://images.unsplash.com/photo-1511920183353-3c9c95275a53?w=400',
    nftCoupon: true,
    trending: true,
  },
  {
    id: '6',
    businessId: '6',
    title: '15% Off Books',
    description: 'Expand your library with a 15% discount on all books.',
    discount: '15%',
    category: 'Books',
    endDate: '2024-12-10',
    image: 'https://images.unsplash.com/photo-1511920183353-3c9c95275a53?w=400',
    nftCoupon: false,
    trending: false,
  },
];

export const mockRewardTokens = [
  {
    name: "PizzaCoin",
    symbol: "PIZZA",
    balance: 150,
    business: "Pizza Place",
    color: "#FF5733",
    trend: "up" as const,
    trendValue: 25,
  },
  {
    name: "CoffeeCoin",
    symbol: "COFFEE",
    balance: 45,
    business: "Coffee Corner",
    color: "#C70039",
    trend: "up" as const,
    trendValue: 12,
  },
  {
    name: "TechCoin",
    symbol: "TECH",
    balance: 89,
    business: "Tech World",
    color: "#900C3F",
    trend: "down" as const,
    trendValue: 5,
  },
];

export const mockLeaderboard = [
  {
    rank: 1,
    name: "Rajesh Kumar",
    avatar: "/placeholder-avatar.svg",
    achievement: "Top PizzaCoin Earner",
    score: 3000,
    badge: "Pizza King",
  },
  {
    rank: 2,
    name: "Priya Singh",
    avatar: "/placeholder-avatar.svg",
    achievement: "Most Coffees Shared",
    score: 2500,
    badge: "Coffee Queen",
  },
  {
    rank: 3,
    name: "Amit Patel",
    avatar: "/placeholder-avatar.svg",
    achievement: "Tech Guru",
    score: 2200,
    badge: "Gadgeteer",
  },
  {
    rank: 4,
    name: "Sunita Gupta",
    avatar: "/placeholder-avatar.svg",
    achievement: "Fashion Icon",
    score: 2000,
    badge: "Stylista",
  },
  {
    rank: 5,
    name: "Vikram Singh",
    avatar: "/placeholder-avatar.svg",
    achievement: "Gourmet Expert",
    score: 1800,
    badge: "Foodie",
  },
];

export const mockUserStats = {
  totalSpent: 15000,
  businessesSupported: 30,
  friendsReferred: 10,
  tokensEarned: 1500,
  nftCouponsCollected: 20,
  communityRank: 10,
};

export const mockCommunityStats = {
  totalUsers: 20000,
  activeBusinesses: 500,
  monthlyVolume: 30000000, // in INR
  communityPool: 1500000, // in INR
  loansActive: 30,
  averageYield: 9.0, // percentage
};

export const mockTransactions = [];
