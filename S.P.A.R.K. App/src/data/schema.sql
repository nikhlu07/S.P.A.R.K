-- Database schema for the S.P.A.R.K. social commerce platform

CREATE TABLE businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT,
    category TEXT,
    distance TEXT,
    rating REAL,
    friends_love INTEGER
);

CREATE TABLE deals (
    id TEXT PRIMARY KEY,
    business_id TEXT REFERENCES businesses(id),
    title TEXT NOT NULL,
    description TEXT,
    discount TEXT,
    valid_until TEXT,
    nft_coupon BOOLEAN,
    trending BOOLEAN
);

CREATE TABLE reward_tokens (
    name TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    balance INTEGER,
    business TEXT,
    color TEXT,
    trend TEXT,
    trend_value INTEGER
);

CREATE TABLE leaderboard (
    rank INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    achievement TEXT,
    score INTEGER,
    badge TEXT
);

CREATE TABLE user_stats (
    id SERIAL PRIMARY KEY,
    total_spent INTEGER,
    businesses_supported INTEGER,
    friends_referred INTEGER,
    tokens_earned INTEGER,
    nft_coupons_collected INTEGER,
    community_rank INTEGER
);

CREATE TABLE community_stats (
    id SERIAL PRIMARY KEY,
    total_users INTEGER,
    active_businesses INTEGER,
    monthly_volume BIGINT,
    community_pool BIGINT,
    loans_active INTEGER,
    average_yield REAL
);

-- Insert mock data for businesses
INSERT INTO businesses (id, name, image, category, distance, rating, friends_love) VALUES
('1', 'Pizza Place', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 'Food', '150m', 4.5, 12),
('2', 'Coffee Corner', 'https://images.unsplash.com/photo-1511920183353-3c9c95275a53?w=400', 'Beverages', '250m', 4.7, 25),
('3', 'Tech World', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400', 'Electronics', '1km', 4.9, 50),
('4', 'Style Hub', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', 'Apparel', '500m', 4.6, 18),
('5', 'Gourmet Garden', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', 'Food', '750m', 4.8, 32),
('6', 'Readers Nook', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 'Books', '300m', 4.7, 22);

-- Insert mock data for deals
INSERT INTO deals (id, business_id, title, description, discount, valid_until, nft_coupon, trending) VALUES
('1', '1', '50% Off All Pizzas', 'Enjoy a flat 50% discount on all pizza varieties. Limited time offer!', '50%', '2024-12-31', true, true),
('2', '2', 'BOGO on Coffee', 'Buy any coffee and get another one absolutely free. Perfect for sharing!', 'BOGO', '2024-11-30', false, true),
('3', '3', '20% Off Electronics', 'Get a 20% discount on a wide range of electronics. Upgrade your gadgets now!', '20%', '2024-12-15', true, false),
('4', '4', '30% Off Fashion', 'Update your wardrobe with the latest trends and get 30% off.', '30%', '2024-11-25', false, false),
('5', '5', 'Free Dessert with Meal', 'Enjoy a complimentary dessert with every main course ordered.', 'Free', '2024-12-01', true, true),
('6', '6', '15% Off Books', 'Expand your library with a 15% discount on all books.', '15%', '2024-12-10', false, false);

-- Insert mock data for reward tokens
INSERT INTO reward_tokens (name, symbol, balance, business, color, trend, trend_value) VALUES
('PizzaCoin', 'PIZZA', 150, 'Pizza Place', '#FF5733', 'up', 25),
('CoffeeCoin', 'COFFEE', 45, 'Coffee Corner', '#C70039', 'up', 12),
('TechCoin', 'TECH', 89, 'Tech World', '#900C3F', 'down', 5);

-- Insert mock data for leaderboard
INSERT INTO leaderboard (rank, name, avatar, achievement, score, badge) VALUES
(1, 'Rajesh Kumar', '/placeholder-avatar.svg', 'Top PizzaCoin Earner', 3000, 'Pizza King'),
(2, 'Priya Singh', '/placeholder-avatar.svg', 'Most Coffees Shared', 2500, 'Coffee Queen'),
(3, 'Amit Patel', '/placeholder-avatar.svg', 'Tech Guru', 2200, 'Gadgeteer'),
(4, 'Sunita Gupta', '/placeholder-avatar.svg', 'Fashion Icon', 2000, 'Stylista'),
(5, 'Vikram Singh', '/placeholder-avatar.svg', 'Gourmet Expert', 1800, 'Foodie');

-- Insert mock data for user stats
INSERT INTO user_stats (total_spent, businesses_supported, friends_referred, tokens_earned, nft_coupons_collected, community_rank) VALUES
(15000, 30, 10, 1500, 20, 10);

-- Insert mock data for community stats
INSERT INTO community_stats (total_users, active_businesses, monthly_volume, community_pool, loans_active, average_yield) VALUES
(20000, 500, 30000000, 1500000, 30, 9.0);