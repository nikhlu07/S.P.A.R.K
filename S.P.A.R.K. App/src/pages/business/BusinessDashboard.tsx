
import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Terminal, Banknote, Ticket, Store, User, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoanApplicationDialog } from '@/components/LoanApplicationDialog';
import { useWeb3 } from '@/contexts/Web3Context';

// Interface for data objects
interface Loan {
  id: string;
  amount: string;
  status: string;
  date: string;
  repaymentPercentage: string;
}

interface Coupon {
  title: string;
  description: string;
  code: string;
  discount: string;
  discountType: 'percentage' | 'fixed';
  status: string;
  expiry: string;
  terms: string;
}

interface Listing {
    companyName: string;
    totalStocks: number;
    listedDate: string;
    status: string;
}

const LiveClock = () => {
    const [time, setTime] = useState('');
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            setTime(now.toLocaleTimeString('en-US', options).replace(' ', '') + ' IST');
        };
        const timerId = setInterval(updateTime, 1000);
        updateTime();
        return () => clearInterval(timerId);
    }, []);
    return <span id="live-time">{time}</span>;
}

const BusinessDashboard = () => {
  const { 
    isConnected, 
    account, 
    balance, 
    usdtBalance, 
    campaigns, 
    businesses,
    poolInfo 
  } = useWeb3();
  
  const [isVerified, setIsVerified] = useState(false);
  const [isLoanApplicationOpen, setIsLoanApplicationOpen] = useState(false);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const mouseGlowRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  // State for form inputs
  const [couponData, setCouponData] = useState({ title: '', description: '', code: '', discount: '', discountType: 'percentage' as 'percentage' | 'fixed', expiry: '', terms: '' });

  // State for table data
  const [loans, setLoans] = useState<Loan[]>([
    { id: 'L001', amount: '$10,000', status: 'Approved', date: '2023-01-15', repaymentPercentage: '5%' },
  ]);
  const [coupons, setCoupons] = useState<Coupon[]>([
    { title: 'Summer Sale', description: 'Get 25% off on all handmade goods.', code: 'SUMMER25', discount: '25%', discountType: 'percentage', status: 'Active', expiry: '2024-08-31', terms: 'This offer cannot be combined with other promotions.' },
  ]);
  const [listings, setListings] = useState<Listing[]>([]);

  // Real blockchain data for user and business
  const userData = {
    name: 'Nikhil',
    email: 'nikhil@elykid.com',
    sparkId: `SPK-USER-${account?.slice(-8) || 'N1K2H3'}`,
    walletAddress: account || 'Not Connected',
    balance: balance || '0',
    usdtBalance: usdtBalance || '0'
  };

  // Get the first business or use default
  const currentBusiness = businesses.length > 0 ? businesses[0] : null;
  const businessData = {
    name: currentBusiness?.name || 'Elykid Private Limited',
    type: currentBusiness?.category || 'Technology',
    address: currentBusiness?.businessAddress || 'Not Registered',
    trustScore: currentBusiness?.trustScore || 0,
    totalVolume: currentBusiness?.totalVolume || 0,
    isVerified: currentBusiness?.isVerified || false,
    location: currentBusiness?.location || 'Lucknow, India',
    get verificationStatus() {
      return this.isVerified ? 'Verified' : 'Not Verified';
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id in couponData) {
        setCouponData({ ...couponData, [id]: value });
    }
  };

  const handleSelectChange = (value: 'percentage' | 'fixed') => {
    setCouponData({ ...couponData, discountType: value });
  };

  const handleLoanSubmit = (data: { amount: string; purpose: string; repaymentPercentage: string }) => {
    const newLoan: Loan = {
        id: `L${(loans.length + 1).toString().padStart(3, '0')}`,
        amount: `$${Number(data.amount).toLocaleString()}`,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        repaymentPercentage: `${data.repaymentPercentage}%`,
    };
    setLoans([...loans, newLoan]);
    setIsLoanApplicationOpen(false);
  };

  const handleCouponSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newCoupon: Coupon = {
        ...couponData,
        code: couponData.code.toUpperCase(),
        discount: couponData.discountType === 'percentage' ? `${couponData.discount}%` : `$${Number(couponData.discount).toLocaleString()}`,
        status: 'Active',
    };
    setCoupons([...coupons, newCoupon]);
    setCouponData({ title: '', description: '', code: '', discount: '', discountType: 'percentage', expiry: '', terms: '' });
    setIsCouponDialogOpen(false); // Close dialog on submit
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseGlowRef.current) {
        requestAnimationFrame(() => {
            mouseGlowRef.current!.style.left = `${e.clientX}px`;
            mouseGlowRef.current!.style.top = `${e.clientY}px`;
        });
      }
    };
    const handleMouseLeave = () => { if(mouseGlowRef.current) mouseGlowRef.current.style.opacity = '0'; };
    const handleMouseEnter = () => { if(mouseGlowRef.current) mouseGlowRef.current.style.opacity = '1'; };

    document.body.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-section');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sectionsRef.current.forEach(section => {
        if (section) observer.observe(section);
    });


    return () => {
      document.body.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      sectionsRef.current.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen antialiased">
        <div className="stars-container">
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
        </div>
        <div id="mouse-glow" ref={mouseGlowRef}></div>
        <div className="scanline-overlay"></div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-opacity-50 bg-black/30 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex-shrink-0">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="/logo.png" alt="S.P.A.R.K. Logo" width="50"/>
                        <span className="font-tech text-2xl font-bold tracking-wider text-white text-glow">S.P.A.R.K.</span>
                    </Link>
                </div>
                <nav className="hidden md:flex md:space-x-8 font-tech">
                    <a href="#profile" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 hover:text-glow">Profile</a>
                    <a href="#loans" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 hover:text-glow">Loans</a>
                    <a href="#coupons" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 hover:text-glow">Coupons</a>
                    <a href="#exchange" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 hover:text-glow">Exchange</a>
                </nav>
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" className="text-white border-purple-500 hover:bg-purple-500/20 hover:text-white">
                        <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="text-white border-purple-500 hover:bg-purple-500/20 hover:text-white">Logout</Button>
                </div>
            </div>
        </div>
      </header>
      <main className="pt-20">
        <section className="relative hero-bg pt-12 pb-10 md:pt-16 md:pb-14">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="font-tech text-purple-400 text-sm mb-4 flex justify-center items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="status-light"></span>
                        <span>SYSTEM STATUS: OPERATIONAL</span>
                    </div>
                    <span>|</span>
                    <LiveClock />
                </div>
                <h1 className="font-tech text-4xl md:text-6xl font-extrabold text-white tracking-tighter mt-4 text-glow">
                    Business Dashboard
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-400">
                    Manage your SPARK assets and operations.
                </p>
                <div className="mt-6">
                    <Button onClick={() => setIsVerified(!isVerified)} className="glow-button font-semibold text-white px-6 py-2 rounded-lg">
                        Toggle Verification Status
                    </Button>
                </div>
                 {!isVerified && (
                    <Alert className="max-w-3xl mx-auto mt-6 border-yellow-500/50 text-yellow-500 bg-yellow-900/10">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Verification Required</AlertTitle>
                        <AlertDescription>
                            Your account is not verified. Please complete the verification process to access all features.
                            <Button asChild variant="link" className="p-0 h-auto ml-2 text-yellow-400 hover:text-yellow-300">
                                <Link to="/business/verify">Verify Now</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </section>

        <section id="profile" ref={el => sectionsRef.current[0] = el} className="py-16 md:py-20">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-tech text-3xl md:text-4xl font-bold text-white text-glow">Profile Information</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Your personal and business identity on the SPARK network.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="card-border-glow p-8 rounded-lg">
                         <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/10 text-purple-400 mb-6">
                            <User className="w-6 h-6"/>
                        </div>
                        <h3 className="font-tech text-xl font-bold text-white">User Information</h3>
                        <ul className="mt-4 space-y-2 text-gray-400">
                            <li><strong>Name:</strong> {userData.name}</li>
                            <li><strong>Email:</strong> {userData.email}</li>
                            <li className="font-tech"><strong>SPARK ID:</strong> {userData.sparkId}</li>
                            <li><strong>Wallet:</strong> {userData.walletAddress}</li>
                            <li><strong>KAIA Balance:</strong> {parseFloat(userData.balance).toFixed(4)}</li>
                            <li><strong>USDT Balance:</strong> {parseFloat(userData.usdtBalance).toFixed(2)}</li>
                        </ul>
                    </div>
                    <div className="card-border-glow p-8 rounded-lg">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/10 text-purple-400 mb-6">
                            <Briefcase className="w-6 h-6"/>
                        </div>
                        <h3 className="font-tech text-xl font-bold text-white">Business Information</h3>
                        <ul className="mt-4 space-y-2 text-gray-400">
                            <li><strong>Name:</strong> {businessData.name}</li>
                            <li><strong>Type:</strong> {businessData.type}</li>
                            <li><strong>Location:</strong> {businessData.location}</li>
                            <li><strong>Trust Score:</strong> {businessData.trustScore}/100</li>
                            <li><strong>Total Volume:</strong> {businessData.totalVolume} USDT</li>
                            <li><strong>Verification Status:</strong> 
                                <span className={businessData.isVerified ? 'text-green-400' : 'text-yellow-400'}>
                                    {businessData.verificationStatus}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section id="loans" ref={el => sectionsRef.current[1] = el} className="py-16 md:py-20">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-tech text-3xl md:text-4xl font-bold text-white text-glow">Loan Management</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Manage your business loans.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="card-border-glow p-8 rounded-lg md:col-span-1">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/10 text-purple-400 mb-6">
                            <Banknote className="w-6 h-6"/>
                        </div>
                        <h3 className="font-tech text-xl font-bold text-white">Apply for Loan</h3>
                        <p className="mt-4 text-gray-400">Get access to community-funded Quantum Yield Pools for local growth.</p>
                        <Button onClick={() => setIsLoanApplicationOpen(true)} className="glow-button font-semibold text-white px-8 py-3 rounded-lg mt-6" disabled={!isVerified}>Apply for a new loan</Button>
                    </div>
                    <div className="card-border-glow p-8 rounded-lg md:col-span-2">
                        <h3 className="font-tech text-xl font-bold text-white mb-4">Existing Loans</h3>
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-transparent">
                              <TableHead className="text-gray-400">Loan ID</TableHead>
                              <TableHead className="text-gray-400">Amount</TableHead>
                              <TableHead className="text-gray-400">Daily Repayment</TableHead>
                              <TableHead className="text-gray-400">Status</TableHead>
                              <TableHead className="text-gray-400">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loans.map((loan) => (
                                <TableRow key={loan.id} className="border-gray-800 hover:bg-purple-500/5">
                                  <TableCell className="text-white font-tech">{loan.id}</TableCell>
                                  <TableCell className="text-white">{loan.amount}</TableCell>
                                  <TableCell className="text-white">{loan.repaymentPercentage}</TableCell>
                                  <TableCell className={loan.status === 'Approved' ? 'text-green-400' : 'text-yellow-400'}>{loan.status}</TableCell>
                                  <TableCell className="text-white">{loan.date}</TableCell>
                                </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </section>

        <section id="coupons" ref={el => sectionsRef.current[2] = el} className="py-16 md:py-20">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-tech text-3xl md:text-4xl font-bold text-white text-glow">Coupon Campaigns</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Create and manage your promotional coupons.</p>
                </div>
                <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card-border-glow p-8 rounded-lg md:col-span-1">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/10 text-purple-400 mb-6">
                                <Ticket className="w-6 h-6"/>
                            </div>
                            <h3 className="font-tech text-xl font-bold text-white">Create Coupon</h3>
                            <p className="mt-4 text-gray-400">Generate viral, self-replicating NFT coupon campaigns.</p>
                            <DialogTrigger asChild>
                                <Button className="glow-button font-semibold text-white px-8 py-3 rounded-lg mt-6">Create a new coupon</Button>
                            </DialogTrigger>
                        </div>
                        <div className="card-border-glow p-8 rounded-lg md:col-span-2">
                            <h3 className="font-tech text-xl font-bold text-white mb-4">
                                {isConnected && campaigns.length > 0 ? 'Active Campaigns' : 'Existing Coupons'}
                            </h3>
                            {isConnected && campaigns.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-gray-800 hover:bg-transparent">
                                      <TableHead className="text-gray-400">Campaign</TableHead>
                                      <TableHead className="text-gray-400">Type</TableHead>
                                      <TableHead className="text-gray-400">Discount</TableHead>
                                      <TableHead className="text-gray-400">Claimed</TableHead>
                                      <TableHead className="text-gray-400">Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {campaigns.map((campaign) => (
                                        <TableRow key={campaign.campaignId} className="border-gray-800 hover:bg-purple-500/5">
                                          <TableCell className="text-white">{campaign.name}</TableCell>
                                          <TableCell className="text-white">{campaign.isViral ? 'Viral' : 'Standard'}</TableCell>
                                          <TableCell className="text-white">{campaign.discountPercentage}%</TableCell>
                                          <TableCell className="text-white">{campaign.claimedCoupons}/{campaign.totalCoupons}</TableCell>
                                          <TableCell className={campaign.isActive ? 'text-green-400' : 'text-yellow-400'}>
                                            {campaign.isActive ? 'Active' : 'Inactive'}
                                          </TableCell>
                                        </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                            ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-gray-800 hover:bg-transparent">
                                      <TableHead className="text-gray-400">Title</TableHead>
                                      <TableHead className="text-gray-400">Code</TableHead>
                                      <TableHead className="text-gray-400">Discount</TableHead>
                                      <TableHead className="text-gray-400">Status</TableHead>
                                      <TableHead className="text-gray-400">Expiry</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {coupons.map((coupon) => (
                                        <TableRow key={coupon.code} className="border-gray-800 hover:bg-purple-500/5">
                                          <TableCell className="text-white">{coupon.title}</TableCell>
                                          <TableCell className="text-white font-tech">{coupon.code}</TableCell>
                                          <TableCell className="text-white">{coupon.discount}</TableCell>
                                          <TableCell className={coupon.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}>{coupon.status}</TableCell>
                                          <TableCell className="text-white">{coupon.expiry}</TableCell>
                                        </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                    <DialogContent className="bg-black/80 backdrop-blur-md border border-purple-500/50 text-white">
                        <DialogHeader>
                          <DialogTitle className="font-tech text-2xl text-glow">Create New Coupon</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Fill in the details to generate a new coupon campaign.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCouponSubmit} className="mt-4 grid grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="title" className="text-gray-400">Deal Title</Label>
                                <Input id="title" placeholder="e.g., 25% Off Everything" value={couponData.title} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description" className="text-gray-400">Description</Label>
                                <Textarea id="description" placeholder="A brief description of your deal" value={couponData.description} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-gray-400">Coupon Code</Label>
                                <Input id="code" placeholder="e.g., SPARK25" value={couponData.code} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white font-tech" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400">Discount Type</Label>
                                <Select onValueChange={handleSelectChange} value={couponData.discountType}>
                                    <SelectTrigger className="w-full bg-black/50 border-gray-700 text-white">
                                        <SelectValue placeholder="Select discount type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/80 border-gray-700 text-white">
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discount" className="text-gray-400">Discount Value</Label>
                                <Input id="discount" type="number" placeholder="e.g., 25" value={couponData.discount} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiry" className="text-gray-400">Expiry Date</Label>
                                <Input id="expiry" type="date" value={couponData.expiry} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="terms" className="text-gray-400">Terms & Conditions</Label>
                                <Textarea id="terms" rows={3} placeholder="e.g., This offer cannot be combined with other promotions." value={couponData.terms} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                            </div>
                            <DialogFooter className="md:col-span-2">
                              <Button type="button" onClick={() => setIsCouponDialogOpen(false)} variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white">Cancel</Button>
                              <Button type="submit" className="glow-button font-semibold text-white px-4 py-2 rounded-lg">Create Coupon</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </section>

        <section id="exchange" ref={el => sectionsRef.current[3] = el} className="py-16 md:py-20">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-tech text-3xl md:text-4xl font-bold text-white text-glow">Local Exchange</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Manage your company listing on the local exchange.</p>
                </div>
                
                {listings.length === 0 ? (
                    <div className="card-border-glow p-8 rounded-lg max-w-2xl mx-auto text-center">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/10 text-purple-400 mb-6 mx-auto">
                            <Store className="w-6 h-6"/>
                        </div>
                        <h3 className="font-tech text-xl font-bold text-white">Create a Listing</h3>
                        <p className="mt-4 text-gray-400">Engage in hyper-local commerce and trade with your community by listing your company on the exchange.</p>
                        {isVerified ? (
                            <Button asChild className="glow-button font-semibold text-white px-8 py-3 rounded-lg mt-6">
                               <Link to="/business/exchange-listing">Create a new listing</Link>
                            </Button>
                        ) : (
                            <Button className="glow-button font-semibold text-white px-8 py-3 rounded-lg mt-6" disabled>
                               Create a new listing
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="card-border-glow p-8 rounded-lg max-w-4xl mx-auto">
                        <h3 className="font-tech text-2xl font-bold text-white text-glow mb-6 text-center">Your Company Listing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-tech text-xl font-bold text-white">{listings[0].companyName}</h4>
                                <p className="text-gray-400">{businessData.type}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-lg font-bold ${listings[0].status === 'Listed' ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {listings[0].status}
                                </p>
                                <p className="text-sm text-gray-500">Listed on {listings[0].listedDate}</p>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-800/50">
                            <h4 className="font-tech text-xl font-bold text-white mb-4">Stock Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="card-border-glow p-4 rounded-lg">
                                    <p className="font-tech text-3xl font-bold text-white text-glow">{listings[0].totalStocks.toLocaleString()}</p>
                                    <p className="text-gray-400">Total Stocks</p>
                                </div>
                                <div className="card-border-glow p-4 rounded-lg">
                                    <p className="font-tech text-3xl font-bold text-white text-glow">$1.00</p>
                                    <p className="text-gray-400">Current Price</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>

        <LoanApplicationDialog isOpen={isLoanApplicationOpen} onClose={() => setIsLoanApplicationOpen(false)} onSubmit={handleLoanSubmit} />
      </main>
    </div>
  );
};

export default BusinessDashboard;
