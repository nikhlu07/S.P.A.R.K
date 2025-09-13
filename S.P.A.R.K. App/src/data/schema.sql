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
