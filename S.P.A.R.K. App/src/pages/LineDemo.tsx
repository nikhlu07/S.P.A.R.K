import React, { useState } from 'react';
import { LineMiniDapp } from '@/components/LineMiniDapp';
import { LineProvider } from '@/contexts/LineContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Zap, 
  Share2, 
  Users, 
  ArrowRight,
  QrCode,
  Smartphone
} from 'lucide-react';

const LineDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('demo');
  const [transactionHistory, setTransactionHistory] = useState<string[]>([]);

  const handleTransactionComplete = (txHash: string) => {
    setTransactionHistory(prev => [txHash, ...prev]);
  };

  const handleInviteSent = (count: number) => {
    console.log(`Invited ${count} friends via LINE`);
  };

  return (
    <LineProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">LINE Mini-Dapp Demo</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience S.P.A.R.K.'s DeFi protocol integrated with LINE messenger for seamless social finance
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'demo'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('demo')}
            >
              Live Demo
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'features'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'setup'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('setup')}
            >
              Setup Guide
            </button>
          </div>

          {activeTab === 'demo' && (
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Live LINE Mini-Dapp
                  </CardTitle>
                  <CardDescription>
                    Interact with S.P.A.R.K. through LINE messenger
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LineMiniDapp 
                    onTransactionComplete={handleTransactionComplete}
                    onInviteSent={handleInviteSent}
                  />
                </CardContent>
              </Card>

              {transactionHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {transactionHistory.map((txHash, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <code className="text-sm font-mono text-gray-600">
                            {txHash.slice(0, 16)}...{txHash.slice(-8)}
                          </code>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Confirmed
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle>DeFi Payments</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Send and receive crypto payments directly through LINE messenger with zero fees and instant settlement.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Share2 className="h-5 w-5 text-green-600" />
                    </div>
                    <CardTitle>Social Sharing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Share deals, businesses, and payment successes with your LINE contacts to earn bonus rewards.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle>Friend Invites</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Invite friends to join S.P.A.R.K. through LINE and earn commission on their transactions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <MessageCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <CardTitle>Chat Commands</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Use natural language commands in LINE to check balances, find deals, and manage your portfolio.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Setup Instructions</CardTitle>
                  <CardDescription>
                    Get your LINE Mini-Dapp running in 3 simple steps
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Create LINE Developer Account</h4>
                      <p className="text-gray-600 text-sm">
                        Visit developers.line.biz and create a new provider account. Register your Mini-Dapp to get API credentials.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Configure Environment Variables</h4>
                      <p className="text-gray-600 text-sm">
                        Add your LINE_CLIENT_ID, LINE_CLIENT_SECRET, and LINE_CHANNEL_ACCESS_TOKEN to your .env file.
                      </p>
                      <code className="block mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                        LINE_CLIENT_ID=your_client_id_here<br/>
                        LINE_CLIENT_SECRET=your_client_secret_here<br/>
                        LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
                      </code>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Deploy & Test</h4>
                      <p className="text-gray-600 text-sm">
                        Deploy your app and test the LINE integration by scanning the QR code in LINE messenger.
                      </p>
                      <Button className="mt-2" onClick={() => window.open('https://line.me/R/nv/QRCodeReader', '_blank')}>
                        <QrCode className="h-4 w-4 mr-2" />
                        Open LINE QR Scanner
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webhook Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Set up webhooks in LINE Developer Console to receive real-time messages:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li>Set your webhook URL to: <code>https://your-deployment-domain/api/line/webhook</code></li>
                    <li>Enable message events</li>
                    <li>Enable follow/unfollow events</li>
                    <li>Verify webhook signature</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-2">
            <Button 
              onClick={() => window.open('https://developers.line.biz/', '_blank')}
              className="shadow-lg"
              size="sm"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              LINE Developers
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://line.me/R/nv/QRCodeReader', '_blank')}
              size="sm"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Test in LINE
            </Button>
          </div>
        </div>
      </div>
    </LineProvider>
  );
};