import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, Gift, TrendingUp, Star, Crown } from 'lucide-react';
import { FriendInvitation } from '@/components/FriendInvitation';
import { useSupabase } from '@/contexts/SupabaseContext';

const Community = () => {
  const { leaderboard, communityStats } = useSupabase();
  const [activeTab, setActiveTab] = useState('friends');

  const achievements = [
    {
      id: 1,
      title: 'First Purchase',
      description: 'Made your first S.P.A.R.K. payment',
      icon: '🎉',
      earned: true,
      points: 50
    },
    {
      id: 2,
      title: 'Social Butterfly',
      description: 'Invited 5 friends to S.P.A.R.K.',
      icon: '🦋',
      earned: true,
      points: 100
    },
    {
      id: 3,
      title: 'Deal Hunter',
      description: 'Used 10 different deals',
      icon: '🎯',
      earned: false,
      points: 150
    },
    {
      id: 4,
      title: 'Community Champion',
      description: 'Reached top 10 in monthly leaderboard',
      icon: '👑',
      earned: false,
      points: 200
    }
  ];

  const communityHighlights = [
    {
      label: 'Active Users',
      value: communityStats?.total_users?.toLocaleString() || '12,450',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      label: 'Monthly Volume',
      value: `₹${communityStats?.monthly_volume?.toLocaleString() || '2.4M'}`,
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      label: 'Active Businesses',
      value: communityStats?.active_businesses?.toLocaleString() || '850',
      icon: Star,
      color: 'text-purple-400'
    },
    {
      label: 'Community Pool',
      value: `₹${communityStats?.community_pool?.toLocaleString() || '450K'}`,
      icon: Gift,
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans relative antialiased">
      <div className="stars-container">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>
      <div id="mouse-glow"></div>
      <div className="scanline-overlay"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-tech text-4xl md:text-5xl font-bold tracking-wider text-white text-glow mb-4">
            S.P.A.R.K. Community
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Connect with friends, earn rewards, and be part of the decentralized commerce revolution
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {communityHighlights.map((stat, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border-gray-800">
            <TabsTrigger value="friends" className="text-white data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-white data-[state=active]:bg-purple-600">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-white data-[state=active]:bg-purple-600">
              <Crown className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            <FriendInvitation />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Monthly Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.length > 0 ? leaderboard.map((user, index) => (
                    <div
                      key={user.rank}
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-amber-600 text-black' :
                          'bg-gray-600 text-white'
                        }`}>
                          {user.rank}
                        </div>
                        <img
                          src={user.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.achievement}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{user.score.toLocaleString()}</p>
                        <Badge className="bg-purple-600/20 text-purple-400 text-xs">
                          {user.badge}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    // Mock leaderboard data
                    [
                      { rank: 1, name: 'Priya Sharma', score: 2450, badge: 'Champion', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40' },
                      { rank: 2, name: 'Rahul Kumar', score: 2180, badge: 'Expert', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40' },
                      { rank: 3, name: 'Anita Patel', score: 1950, badge: 'Pro', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40' },
                      { rank: 4, name: 'Vikram Singh', score: 1720, badge: 'Advanced', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40' },
                      { rank: 5, name: 'Sneha Gupta', score: 1580, badge: 'Rising Star', avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40' }
                    ].map((user, index) => (
                      <div
                        key={user.rank}
                        className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-amber-600 text-black' :
                            'bg-gray-600 text-white'
                          }`}>
                            {user.rank}
                          </div>
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-sm text-gray-400">Active Trader</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{user.score.toLocaleString()}</p>
                          <Badge className="bg-purple-600/20 text-purple-400 text-xs">
                            {user.badge}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`bg-gray-900/50 border-gray-800 ${
                    achievement.earned ? 'ring-2 ring-green-500/50' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <h3 className="text-white font-bold">{achievement.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-purple-600/20 text-purple-400">
                              +{achievement.points} points
                            </Badge>
                            {achievement.earned && (
                              <Badge className="bg-green-600/20 text-green-400">
                                ✓ Earned
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;