
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  DollarSign,
  Users,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Target,
  Clock,
  Shield,
  Info,
  CheckCircle
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useSupabase } from '@/contexts/SupabaseContext';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import {web3Service} from '@/services/web3Service';

const Invest = () => {
  const { toast } = useToast();
  const { isConnected, account, balance, usdtBalance, poolInfo, investInPool } = useWeb3();
  const { userTransactions } = useSupabase();
  const [investAmount, setInvestAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [poolStats, setPoolStats] = useState<any>(null);
  const [investmentTransactions, setInvestmentTransactions] = useState<any[]>([]);
  const [pendingLoans, setPendingLoans] = useState<any[]>([]);
  const [investAmounts, setInvestAmounts] = useState<{[key: number]: string}>({});

  // Load data from database and smart contracts
  
  useEffect(() => {
    const loadInvestmentData = async () => {
    try {
      // Load pool statistics from database
      const poolData = await supabaseService.getPoolStatistics();
      if (poolData) {
        setPoolStats(poolData);
      }

      // Load user investments if connected
      if (account) {
        const investments = await supabaseService.getUserInvestments(account);
        setUserInvestments(investments);
        const transactions = await supabaseService.getInvestmentTransactions(account);
        setInvestmentTransactions(transactions);
      }

      const pending = await web3Service.getPendingLoans();
      setPendingLoans(pending);
    } catch (error) {
      console.error('Failed to load investment data:', error);
    }
  };

  loadInvestmentData();
}, [account]);

  // Combine smart contract data with database data
  const poolData = {
    totalInvested: poolInfo?.totalInvested || poolStats?.total_invested || 125000,
    totalBorrowed: poolInfo?.totalBorrowed || poolStats?.total_borrowed || 89000,
    availableLiquidity: poolInfo?.availableLiquidity || poolStats?.available_liquidity || 36000,
    totalInvestors: poolInfo?.totalInvestors || poolStats?.total_investors || 342,
    currentAPY: poolStats?.current_apy || 12.5,
    averageYield: poolInfo?.averageYield || 11.8,
    riskLevel: 'Medium',
    lockPeriod: '30 days',
    minInvestment: 100
  };

  // Use real transaction data or fallback to mock
  const recentTransactions = investmentTransactions.length > 0
    ? investmentTransactions.map(tx => ({
      type: tx.transaction_type,
      amount: tx.amount,
      date: new Date(tx.created_at).toISOString().split('T')[0],
      status: tx.status
    }))
    : [
      { type: 'invest', amount: 5000, date: '2024-01-15', status: 'completed' },
      { type: 'withdraw', amount: 1200, date: '2024-01-10', status: 'completed' },
      { type: 'invest', amount: 2500, date: '2024-01-05', status: 'completed' },
      { type: 'interest', amount: 45.5, date: '2024-01-01', status: 'completed' }
    ];

  const handleInvest = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to invest.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(investAmount);
    if (!amount || amount < poolData.minInvestment) {
      toast({
        title: "Invalid Amount",
        description: `Minimum investment is ₹${poolData.minInvestment}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > parseFloat(usdtBalance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough USDT balance.",
        variant: "destructive"
      });
      return;
    }

    setIsInvesting(true);

    try {
      // Blockchain-first: Investment MUST succeed on blockchain
      console.log('🔗 Processing investment on Kaia blockchain...');
      const txHash = await investInPool(investAmount);
      console.log('✅ Blockchain investment successful:', txHash);

      // Save investment to database
      const newInvestment = await supabaseService.createInvestment({
        user_id: account!,
        wallet_address: account!,
        amount: amount,
        apy: poolData.currentAPY,
        transaction_hash: txHash,
        maturity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Create investment transaction record
      await supabaseService.createInvestmentTransaction({
        user_id: account!,
        wallet_address: account!,
        investment_id: newInvestment.id,
        transaction_type: 'invest',
        amount: amount,
        transaction_hash: txHash
      });

      // Update local state
      setUserInvestments([newInvestment, ...userInvestments]);
      setInvestAmount('');

      toast({
        title: "Investment Successful! 🎉",
        description: `Invested ₹${amount} in Quantum Lending Pool at ${poolData.currentAPY}% APY`,
      });

    } catch (error) {
      toast({
        title: "Investment Failed",
        description: "There was an error processing your investment.",
        variant: "destructive"
      });
    } finally {
      setIsInvesting(false);
    }
  };

  const handleInvestInLoan = async (loanId: number) => {
    const amount = investAmounts[loanId];
    if (!amount || !isConnected) return;
    
    setIsInvesting(true);
    try {
      await web3Service.connectWallet();
      const txHash = await web3Service.investInLoan(loanId, amount);
      console.log('Investment successful:', txHash);
      toast({
        title: "Investment Successful!",
        description: `Transaction hash: ${txHash}`,
      });
      // Refresh pending loans
      const updatedPending = await web3Service.getPendingLoans();
      setPendingLoans(updatedPending);
      // Clear input
      setInvestAmounts(prev => ({ ...prev, [loanId]: '' }));
    } catch (error) {
      console.error('Investment failed:', error);
    } finally {
      setIsInvesting(false);
    }
  };

  const utilizationRate = (poolData.totalBorrowed / poolData.totalInvested) * 100;

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
            Quantum Lending Pool
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Earn passive income by providing liquidity to local businesses through our AI-powered lending protocol
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">₹{poolData.totalInvested.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Total Pool</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{poolData.currentAPY}%</p>
              <p className="text-sm text-gray-400">Current APY</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{poolData.totalInvestors}</p>
              <p className="text-sm text-gray-400">Investors</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4 text-center">
              <PieChart className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{utilizationRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-400">Utilization</p>
            </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold text-white mb-4">Pending Loans</h2>
            <div className="space-y-4">
              {pendingLoans.map(loan => (
                <Card key={loan.id} className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium">{loan.purpose}</h3>
                    <p className="text-gray-400">{loan.description}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-white">Amount: ${loan.amount}</span>
                      <span className="text-white">Rate: {loan.interestRate}%</span>
                      <span className="text-white">Duration: {loan.duration} months</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Input 
                        type="number" 
                        placeholder="Amount to invest" 
                        value={investAmounts[loan.id] || ''}
                        onChange={e => setInvestAmounts({...investAmounts, [loan.id]: e.target.value})}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                      <Button 
                        onClick={() => handleInvestInLoan(loan.id)}
                        disabled={isInvesting || !investAmounts[loan.id]}
                      >
                        Invest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border-gray-800">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="invest" className="text-white data-[state=active]:bg-purple-600">
              Invest
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="text-white data-[state=active]:bg-purple-600">
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-purple-600">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pool Overview */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Pool Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Utilization Rate</span>
                      <span className="text-white">{utilizationRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={utilizationRate} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Available Liquidity:</span>
                      <span className="text-green-400">₹{poolData.availableLiquidity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Borrowed:</span>
                      <span className="text-white">₹{poolData.totalBorrowed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Level:</span>
                      <Badge className="bg-yellow-600/20 text-yellow-400">{poolData.riskLevel}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Features */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Investment Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">AI Risk Assessment</p>
                        <p className="text-gray-400 text-sm">Smart contract evaluates borrower creditworthiness</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Automated Yield Distribution</p>
                        <p className="text-gray-400 text-sm">Daily interest payments to your wallet</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Flexible Terms</p>
                        <p className="text-gray-400 text-sm">Withdraw anytime with 24h notice</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-gray-900/50 border-gray-800 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Recent Pool Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 5).map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {tx.type === 'invest' ? (
                          <ArrowUpRight className="w-5 h-5 text-green-400" />
                        ) : tx.type === 'withdraw' ? (
                          <ArrowDownRight className="w-5 h-5 text-red-400" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-yellow-400" />
                        )}
                        <div>
                          <p className="text-white font-medium capitalize">{tx.type}</p>
                          <p className="text-gray-400 text-sm">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">₹{tx.amount.toLocaleString()}</p>
                        <Badge className={`text-xs ${tx.status === 'completed' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                          }`}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invest" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Investment Form */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">\n                    <Wallet className="w-5 h-5 text-purple-400" />\n                    Make Investment\n                  </CardTitle>\n                </CardHeader>
                <CardContent className="space-y-4">
                  {!isConnected && (
                    <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-yellow-400" />
                        <p className="text-yellow-400 text-sm">
                          Please connect your wallet to invest
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-gray-400">Investment Amount (USDT)</Label>
                    <Input
                      type="number"
                      placeholder={`Minimum ₹${poolData.minInvestment}`}
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                      disabled={!isConnected}
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Your Balance:</span>
                      <span className="text-white">{parseFloat(usdtBalance).toFixed(2)} USDT</span>
                    </div>
                  </div>

                  {investAmount && parseFloat(investAmount) >= poolData.minInvestment && (
                    <div className="bg-gray-800/50 p-3 rounded-lg space-y-2">
                      <h4 className="text-white font-medium">Investment Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount:</span>
                          <span className="text-white">₹{parseFloat(investAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">APY:</span>
                          <span className="text-green-400">{poolData.currentAPY}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expected Monthly:</span>
                          <span className="text-green-400">
                            ₹{((parseFloat(investAmount) * poolData.currentAPY) / 12 / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Lock Period:</span>
                          <span className="text-white">{poolData.lockPeriod}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleInvest}
                    disabled={!isConnected || isInvesting || !investAmount || parseFloat(investAmount) < poolData.minInvestment}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isInvesting ? "Processing..." : "Invest Now"}
                  </Button>
                </CardContent>
              </Card>

              {/* Investment Info */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-400" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                      <div>
                        <p className="text-white font-medium">Deposit USDT</p>
                        <p className="text-gray-400 text-sm">Your funds are pooled with other investors</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                      <div>
                        <p className="text-white font-medium">AI Lending</p>
                        <p className="text-gray-400 text-sm">Smart contracts lend to verified local businesses</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                      <div>
                        <p className="text-white font-medium">Earn Interest</p>
                        <p className="text-gray-400 text-sm">Receive daily interest payments automatically</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-3">
                    <h4 className="text-blue-400 font-medium mb-2">Risk Factors</h4>
                    <ul className="text-blue-300 text-sm space-y-1">
                      <li>• Smart contract risk</li>
                      <li>• Borrower default risk</li>
                      <li>• Market volatility</li>
                      <li>• Liquidity risk during high demand</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            <div className="space-y-6">
              {/* Portfolio Summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-white">
                      ₹{userInvestments.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">Total Invested</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">
                      ₹{userInvestments.reduce((sum, inv) => sum + inv.earned, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">Total Earned</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-400">
                      {userInvestments.length}
                    </p>
                    <p className="text-sm text-gray-400">Active Investments</p>
                  </CardContent>
                </Card>
              </div>

              {/* Investment List */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Your Investments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userInvestments.length > 0 ? userInvestments.map((investment) => (
                      <div key={investment.id} className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-bold">₹{investment.amount.toLocaleString()}</p>
                            <p className="text-gray-400 text-sm">
                              Invested on {new Date(investment.start_date || investment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`${investment.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                            }`}>
                            {investment.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">APY</p>
                            <p className="text-white font-medium">{investment.apy}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Earned</p>
                            <p className="text-green-400 font-medium">₹{investment.earned_interest.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Maturity</p>
                            <p className="text-white font-medium">
                              {investment.maturity_date ? new Date(investment.maturity_date).toLocaleDateString() : 'Flexible'}
                            </p>
                          </div>
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline" className="text-white border-gray-600">
                              Withdraw
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-400">
                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No investments yet</p>
                        <p className="text-sm">Start investing to see your portfolio here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Performance Chart Placeholder */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Pool Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-800/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Performance chart coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pool Statistics */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Pool Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Loan Size:</span>
                      <span className="text-white">₹25,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Default Rate:</span>
                      <span className="text-green-400">2.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Loan Term:</span>
                      <span className="text-white">45 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pool Inception:</span>
                      <span className="text-white">Jan 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Loans Funded:</span>
                      <span className="text-white">1,247</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Invest;


