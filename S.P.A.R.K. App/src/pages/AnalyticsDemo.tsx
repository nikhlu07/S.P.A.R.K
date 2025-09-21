import React from 'react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

const AnalyticsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📊 S.P.A.R.K Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time platform performance metrics and user engagement analytics
          </p>
        </div>
        
        <AnalyticsDashboard />
        
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📈 Key Insights & Performance Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-800 mb-2">🚀 Growth Trends</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 42% month-over-month user growth</li>
                <li>• 68% increase in transaction volume</li>
                <li>• 3.2x higher engagement vs industry average</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="font-semibold text-green-800 mb-2">💡 Platform Metrics</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 98.7% system uptime reliability</li>
                <li>• 2.1s average API response time</li>
                <li>• 4.8/5 user satisfaction rating</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-xl">
              <h3 className="font-semibold text-purple-800 mb-2">🎯 Business Impact</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• $142K+ total transaction volume</li>
                <li>• 350+ integrated businesses</li>
                <li>• 12.8K+ active platform users</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-xl">
              <h3 className="font-semibold text-orange-800 mb-2">🌟 User Engagement</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 4.2min average session duration</li>
                <li>• 3.8 daily sessions per user</li>
                <li>• 89% feature adoption rate</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="inline-flex items-center bg-gray-100 px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-gray-600">Live data updated every 15 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDemo;
