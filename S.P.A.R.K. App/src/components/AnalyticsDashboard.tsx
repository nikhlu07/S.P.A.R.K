import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for analytics dashboard
const mockData = {
  userGrowth: [
    { month: 'Jan', users: 1200, transactions: 450 },
    { month: 'Feb', users: 1850, transactions: 680 },
    { month: 'Mar', users: 2450, transactions: 920 },
    { month: 'Apr', users: 3120, transactions: 1250 },
    { month: 'May', users: 3980, transactions: 1680 },
    { month: 'Jun', users: 4850, transactions: 2150 },
  ],
  
  transactionMetrics: [
    { name: 'Payments', value: 2150 },
    { name: 'Rewards', value: 980 },
    { name: 'Investments', value: 450 },
    { name: 'NFT Claims', value: 320 },
  ],
  
  platformStats: {
    totalUsers: '12.8K',
    activeUsers: '4.2K',
    totalTransactions: '8.7K',
    totalVolume: '$142K',
    avgSession: '4.2min',
  },
  
  businessDistribution: [
    { name: 'Restaurants', value: 35 },
    { name: 'Retail', value: 28 },
    { name: 'Services', value: 22 },
    { name: 'Entertainment', value: 15 },
  ],
  
  revenueData: [
    { day: 'Mon', revenue: 1250 },
    { day: 'Tue', revenue: 1980 },
    { day: 'Wed', revenue: 2450 },
    { day: 'Thu', revenue: 3120 },
    { day: 'Fri', revenue: 4250 },
    { day: 'Sat', revenue: 3980 },
    { day: 'Sun', revenue: 2850 },
  ],
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Platform Analytics Dashboard</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(mockData.platformStats).map(([key, value]) => (
          <div key={key} className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-indigo-600">{value}</div>
            <div className="text-sm text-gray-600 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">📈 User Growth & Transactions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#0088FE" strokeWidth={2} />
              <Line type="monotone" dataKey="transactions" stroke="#00C49F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Types */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">💳 Transaction Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockData.transactionMetrics}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {mockData.transactionMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">💰 Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Business Distribution */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">🏪 Business Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockData.businessDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {mockData.businessDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-2">🚀 Platform Performance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-bold">98%</div>
            <div>Uptime</div>
          </div>
          <div>
            <div className="font-bold">2.3s</div>
            <div>Avg Response</div>
          </div>
          <div>
            <div className="font-bold">0.01%</div>
            <div>Error Rate</div>
          </div>
          <div>
            <div className="font-bold">4.8/5</div>
            <div>User Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};
