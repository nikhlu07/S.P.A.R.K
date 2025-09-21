// Mock data for home screen tabs
export const mockViralDeals = [
  {
    id: 1,
    title: "50% Off All Pizzas",
    description: "Enjoy a flat 50% discount on all pizza varieties. Limited time offer!",
    business: {
      id: "1",
      name: "Pizza Place",
      category: "Food",
      location: "Mumbai, India",
      owner: "Rajesh Kumar",
      isVerified: true,
      trustScore: 95,
      totalVolume: 15000,
      createdAt: new Date(),
      metadataURI: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop"
    },
    deal: {
      id: 1,
      title: "50% Off All Pizzas",
      description: "Enjoy a flat 50% discount on all pizza varieties. Limited time offer!",
      maxCoupons: 100,
      claimedCoupons: 45,
      discountPercent: 50,
      creator: "0x123...",
      isActive: true,
      createdAt: new Date()
    },
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    discount: "50%",
    nftCoupon: true,
    trending: true,
    claimed: 45,
    total: 100
  },
  {
    id: 2,
    title: "BOGO on Coffee",
    description: "Buy any coffee and get another one absolutely free. Perfect for sharing!",
    business: {
      id: "2",
      name: "Coffee Corner",
      category: "Beverages",
      location: "Delhi, India",
      owner: "Priya Singh",
      isVerified: true,
      trustScore: 88,
      totalVolume: 8500,
      createdAt: new Date(),
      metadataURI: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop"
    },
    deal: {
      id: 2,
      title: "BOGO on Coffee",
      description: "Buy any coffee and get another one absolutely free. Perfect for sharing!",
      maxCoupons: 50,
      claimedCoupons: 32,
      discountPercent: 50,
      creator: "0x456...",
      isActive: true,
      createdAt: new Date()
    },
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
    discount: "BOGO",
    nftCoupon: false,
    trending: true,
    claimed: 32,
    total: 50
  },
  {
    id: 3,
    title: "20% Off Electronics",
    description: "Get a 20% discount on a wide range of electronics. Upgrade your gadgets now!",
    business: {
      id: "3",
      name: "Tech World",
      category: "Electronics",
      location: "Bangalore, India",
      owner: "Amit Patel",
      isVerified: true,
      trustScore: 92,
      totalVolume: 25000,
      createdAt: new Date(),
      metadataURI: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop"
    },
    deal: {
      id: 3,
      title: "20% Off Electronics",
      description: "Get a 20% discount on a wide range of electronics. Upgrade your gadgets now!",
      maxCoupons: 200,
      claimedCoupons: 156,
      discountPercent: 20,
      creator: "0x789...",
      isActive: true,
      createdAt: new Date()
    },
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop",
    discount: "20%",
    nftCoupon: true,
    trending: false,
    claimed: 156,
    total: 200
  }
];

export const mockLocalBusinesses = [
  {
    id: "1",
    name: "Pizza Place",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    category: "Food",
    distance: "150m",
    rating: 4.5,
    friends_love: 12,
    location: "Mumbai, India",
    owner: "Rajesh Kumar",
    isVerified: true,
    trustScore: 95,
    totalVolume: 15000
  },
  {
    id: "2",
    name: "Coffee Corner",
    image: "https://images.unsplash.com/photo-1511920183353-3c9c95275a53?w=400",
    category: "Beverages",
    distance: "250m",
    rating: 4.7,
    friends_love: 25,
    location: "Delhi, India",
    owner: "Priya Singh",
    isVerified: true,
    trustScore: 88,
    totalVolume: 8500
  },
  {
    id: "3",
    name: "Tech World",
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400",
    category: "Electronics",
    distance: "1km",
    rating: 4.9,
    friends_love: 50,
    location: "Bangalore, India",
    owner: "Amit Patel",
    isVerified: true,
    trustScore: 92,
    totalVolume: 25000
  },
  {
    id: "4",
    name: "Style Hub",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    category: "Apparel",
    distance: "500m",
    rating: 4.6,
    friends_love: 18,
    location: "Mumbai, India",
    owner: "Sunita Gupta",
    isVerified: true,
    trustScore: 85,
    totalVolume: 12000
  },
  {
    id: "5",
    name: "Gourmet Garden",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400",
    category: "Food",
    distance: "750m",
    rating: 4.8,
    friends_love: 32,
    location: "Pune, India",
    owner: "Vikram Singh",
    isVerified: true,
    trustScore: 90,
    totalVolume: 18000
  },
  {
    id: "6",
    name: "Readers Nook",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    category: "Books",
    distance: "300m",
    rating: 4.7,
    friends_love: 22,
    location: "Kolkata, India",
    owner: "Anjali Sharma",
    isVerified: true,
    trustScore: 87,
    totalVolume: 9500
  }
];

export const mockTransactions = [
  {
    id: 1,
    user_id: "user_123",
    business_id: "1",
    amount: 25.50,
    currency: "USDT",
    description: "Pizza order with 50% discount",
    status: "completed",
    transaction_hash: "0x1234567890abcdef",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    business: {
      name: "Pizza Place",
      category: "Food"
    }
  },
  {
    id: 2,
    user_id: "user_123",
    business_id: "2",
    amount: 8.75,
    currency: "USDT",
    description: "Coffee BOGO deal",
    status: "completed",
    transaction_hash: "0xabcdef1234567890",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    business: {
      name: "Coffee Corner",
      category: "Beverages"
    }
  },
  {
    id: 3,
    user_id: "user_123",
    business_id: "3",
    amount: 120.00,
    currency: "USDT",
    description: "Electronics purchase with 20% off",
    status: "completed",
    transaction_hash: "0x9876543210fedcba",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    business: {
      name: "Tech World",
      category: "Electronics"
    }
  },
  {
    id: 4,
    user_id: "user_123",
    business_id: "4",
    amount: 45.00,
    currency: "USDT",
    description: "Fashion items purchase",
    status: "pending",
    transaction_hash: "0x456789abcdef1234",
    created_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    business: {
      name: "Style Hub",
      category: "Apparel"
    }
  }
];

export const mockInvestmentData = {
  totalInvested: 1500000,
  totalInvestors: 250,
  activeBusinesses: 45,
  monthlyVolume: 5000000,
  averageYield: 12.5,
  topPerformers: [
    { name: "Pizza Place", return: 18.5, invested: 50000 },
    { name: "Tech World", return: 15.2, invested: 75000 },
    { name: "Coffee Corner", return: 12.8, invested: 30000 }
  ]
};
