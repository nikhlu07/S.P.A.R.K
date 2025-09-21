import React, { useState, useEffect } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Store, Users, TrendingUp, ExternalLink, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BusinessQuickRegister } from './BusinessQuickRegister';

export const BusinessIntegration: React.FC = () => {
  const { isLoggedIn, currentBusiness, getAllBusinesses, getAllActiveDeals } = useBusiness();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [businessesData, dealsData] = await Promise.all([
          getAllBusinesses(),
          getAllActiveDeals()
        ]);
        setBusinesses(businessesData);
        setDeals(dealsData);
      } catch (error) {
        console.error('Failed to load business data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAllBusinesses, getAllActiveDeals]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-white">Loading business integration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Status */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Business Integration Status</span>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Connect your business to S.P.A.R.K. and reach millions of users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoggedIn && currentBusiness ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">{currentBusiness.name}</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Connected
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white ml-2">{currentBusiness.category}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white ml-2">
                    {currentBusiness.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
              <Link to="/business/dashboard">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Store className="w-4 h-4 mr-2" />
                  Go to Business Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <Store className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300 mb-4">
                  Connect your business to start reaching customers through S.P.A.R.K.
                </p>
              </div>
              <div className="space-y-2">
                <Link to="/business">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Building2 className="w-4 h-4 mr-2" />
                    Full Business Portal
                  </Button>
                </Link>
                <p className="text-center text-sm text-gray-400">or</p>
                <BusinessQuickRegister />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{businesses.length}</div>
                <div className="text-sm text-gray-400">Connected Businesses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{deals.length}</div>
                <div className="text-sm text-gray-400">Active Deals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {deals.reduce((sum, deal) => sum + (deal.current_claims || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Total Claims</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Businesses */}
      {businesses.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recently Joined Businesses</CardTitle>
            <CardDescription className="text-gray-300">
              See what businesses are connecting to S.P.A.R.K.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {businesses.slice(0, 3).map((business) => (
                <div key={business.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{business.name}</div>
                      <div className="text-sm text-gray-400">{business.category}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    {business.is_verified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">How Business Integration Works</CardTitle>
          <CardDescription className="text-gray-300">
            Simple steps to connect your business to S.P.A.R.K.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 font-bold">1</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Register Business</h3>
              <p className="text-gray-400 text-sm">
                Connect your wallet and register your business details
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 font-bold">2</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Create Deals</h3>
              <p className="text-gray-400 text-sm">
                Set up promotional deals and campaigns for your customers
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Reach Customers</h3>
              <p className="text-gray-400 text-sm">
                Your deals appear in the user app and LINE Mini App
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
