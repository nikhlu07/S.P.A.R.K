
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
import { Bell, Terminal, Banknote, Ticket, Store, User, Briefcase, Plus, QrCode, Image, List, LogOut } from 'lucide-react';
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
import { LoanApplicationForm } from '@/components/LoanApplicationForm';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useWeb3 } from '@/contexts/Web3Context';
import { verificationService } from '@/services/verificationService';
import { web3Service } from '../../services/web3Service';
import { useBusiness } from '@/contexts/BusinessContext';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

// Interface for data objects
interface Loan {
    id: string;
    amount: string;
    status: string;
    date: string;
    repaymentPercentage: string;
    purpose?: string;
    txHash?: string;
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
    const navigate = useNavigate();
    const {
        isConnected,
        account,
        balance,
        usdtBalance,
        campaigns,
        businesses,
        poolInfo,
        recordSocialInteraction,
        calculateTrustScore,
        createCampaign,
        isLoading: isWeb3Loading // Destructure and rename isLoading
    } = useWeb3();

    const { createDeal } = useBusiness();
    const { addTransaction } = useBlockchain();

    const [businessUser, setBusinessUser] = useState<any | null>(null);
    const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
    const [isVerified, setIsVerified] = useState(false);

    // Authentication guard - check if user is logged in
    useEffect(() => {
        if (isWeb3Loading) {
            setAuthStatus('loading');
            return;
        }

        if (account) {
            let userJson = localStorage.getItem("businessUser");

            if (!userJson) {
                const fallbackBusiness = {
                    id: `fallback_${account}`,
                    name: `Business (${account.slice(0, 6)}...)`,
                    email: `${account.toLowerCase()}@wallet.local`,
                    walletAddress: account,
                    isVerified: verificationService.isBusinessVerified(account),
                    status: 'active',
                    trustScore: 85,
                    totalVolume: 5000
                };
                
                userJson = JSON.stringify(fallbackBusiness);
                localStorage.setItem("businessUser", userJson);
                console.log("✅ Created fallback business session for wallet:", account);
            }

            try {
                const userData = JSON.parse(userJson!);
                if (userData.walletAddress) {
                    setBusinessUser(userData);
                    setAuthStatus('authenticated');
                } else {
                    localStorage.removeItem("businessUser");
                    setAuthStatus('unauthenticated');
                }
            } catch (error) {
                localStorage.removeItem("businessUser");
                setAuthStatus('unauthenticated');
            }
        } else {
            setAuthStatus('unauthenticated');
        }
    }, [account, isWeb3Loading]);

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            navigate('/business/login');
        }
    }, [authStatus, navigate]);

    // Get the first business or use default (moved up before useEffect)
    const currentBusiness = businesses.length > 0 ? businesses[0] : null;

    // Check verification status from service and blockchain
    useEffect(() => {
        if (account) {
            const localVerified = verificationService.isBusinessVerified(account);
            const blockchainVerified = currentBusiness?.isVerified || false;
            setIsVerified(localVerified || blockchainVerified);
        }
    }, [account, currentBusiness?.isVerified]);

    if (!businessUser) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <svg className="animate-spin h-16 w-16 text-blue-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h2 className="text-2xl font-semibold tracking-tight">Loading Dashboard...</h2>
                    <p className="text-gray-400">Please wait while we connect to your wallet and load your business data.</p>
                </div>
            </div>
        );
    }

    const handleCreateDeal = async (dealData: any) => {
        try {
            await web3Service.applyForLoan(data);
            
            // Refresh loans from blockchain
            await fetchLoans();
            
            setIsLoanApplicationOpen(false);
        } catch (error) {
            console.error('Failed to submit loan application:', error);
            // TODO: Show error message
        }
    };

    const handleCouponSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Prepare display coupon
        const newCoupon: Coupon = {
            ...couponData,
            code: couponData.code.toUpperCase(),
            discount: couponData.discountType === 'percentage'
                ? `${couponData.discount}%`
                : `$${Number(couponData.discount).toLocaleString()}`,
            status: 'Active',
        };

        // 1) Try on-chain campaign creation (best-effort)
        const discountPercent = couponData.discountType === 'percentage' ? Number(couponData.discount) : 0;
        const maxCoupons = 100; // default cap for demo
        try {
            const txHash = await createCampaign(
                couponData.title,
                couponData.description,
                maxCoupons,
                isNaN(discountPercent) ? 0 : discountPercent
            );
            if (txHash) {
                // Log a lightweight transaction entry for visibility in Transactions page
                addTransaction({
                    txHash,
                    type: 'reward',
                    amount: '0',
                    currency: 'KAIA',
                    status: 'pending',
                    businessName: businessData.name,
                    dealTitle: couponData.title,
                });
            }
        } catch (err) {
            console.warn('On-chain campaign creation failed or skipped:', err);
        }

        // 2) Persist deal to backend (Supabase)
        try {
            await createDeal({
                title: couponData.title,
                description: couponData.description,
                discount: newCoupon.discount,
                start_date: new Date().toISOString(),
                end_date: couponData.expiry || undefined,
                category: 'Coupon',
                is_active: true,
            });
        } catch (err) {
            console.error('Failed to persist deal to backend:', err);
        }

        // 3) Update local UI state
        setCoupons([...coupons, newCoupon]);
        setCouponData({ title: '', description: '', code: '', discount: '', discountType: 'percentage', expiry: '', terms: '' });
        setIsCouponDialogOpen(false); // Close dialog on submit
    };

    const handleNFTSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Create NFT (simulated for demo)
        const newNFT = {
            id: Date.now().toString(),
            name: nftData.name,
            description: nftData.description,
            price: `$${nftData.price}`,
            image: nftData.image || '/api/placeholder/200/200',
            metadata: nftData.metadata,
            createdAt: new Date().toISOString()
        };
        
        setNfts([...nfts, newNFT]);
        setNftData({ name: '', description: '', price: '', image: '', metadata: '' });
        setIsNFTDialogOpen(false);
        
        // Add transaction record
        addTransaction({
            txHash: `nft-${Date.now()}`,
            type: 'investment',
            amount: nftData.price,
            currency: 'USDT',
            status: 'confirmed',
            businessName: businessData.name,
            dealTitle: `NFT: ${nftData.name}`,
        });
    };

    const handleListingSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Create listing
        const newListing: Listing = {
            companyName: businessData.name,
            totalStocks: Number(listingData.title), // Convert title to number for totalStocks
            listedDate: new Date().toISOString().split('T')[0],
            status: 'Active',
// Remove category property since it's not defined in Listing interface
// Remove image property since it's not defined in Listing interface
            // status: 'Active',
// Remove createdAt since it's not in Listing interface
        };
        
        setListings([...listings, newListing]);
        setListingData({ title: '', description: '', price: '', category: '', image: '' });
        setIsListingDialogOpen(false);
        
        // Add transaction record
        addTransaction({
            txHash: `listing-${Date.now()}`,
            type: 'investment',
            amount: listingData.price,
            currency: 'USDT',
            status: 'confirmed',
            businessName: businessData.name,
            dealTitle: `Listing: ${listingData.title}`,
        });
    };

    const handleQRCodeSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Generate QR code
        const qrCodeContent = `spark:payment?amount=${qrCodeData.amount}&currency=${qrCodeData.currency}&description=${encodeURIComponent(qrCodeData.description)}&business=${encodeURIComponent(businessData.name)}`;
        
        const newQRCode = {
            id: Date.now().toString(),
            amount: qrCodeData.amount,
            currency: qrCodeData.currency,
            description: qrCodeData.description,
            qrContent: qrCodeContent,
            createdAt: new Date().toISOString()
        };
        
        setQrCodes([...qrCodes, newQRCode]);
        setQrCodeData({ amount: '', currency: 'USDT', description: '' });
        setIsQRCodeDialogOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("businessUser");
        navigate('/business/login');
    };

    const handleTestTrustUpdate = async () => {
        if (!account) return;
        try {
            await recordSocialInteraction(account, 1, 10, "Test positive interaction", true);
            const newScore = await calculateTrustScore(account);
            // Update businessData trustScore - assuming we update state
            // For now, log it
            console.log("New Trust Score:", newScore);
            alert(`Trust score updated to ${newScore}`);
        } catch (error) {
            console.error("Error updating trust score:", error);
            alert("Failed to update trust score");
        }
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
        const handleMouseLeave = () => { if (mouseGlowRef.current) mouseGlowRef.current.style.opacity = '0'; };
        const handleMouseEnter = () => { if (mouseGlowRef.current) mouseGlowRef.current.style.opacity = '1'; };

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
                                <img src="/logo.svg" alt="S.P.A.R.K. Logo" width="50" />
                                <span className="font-tech text-2xl font-bold tracking-wider text-white text-glow">S.P.A.R.K.</span>
                            </Link>
                        </div>
                        <nav className="hidden md:flex md:space-x-8 font-tech">
                            <a href="#profile" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 hover:text-glow">Profile</a>
                            <a href="#loans" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 hover:text-glow">Loans</a>
                            <a href="#coupons" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 hover:text-glow">Coupons</a>
                            <a href="#qr-codes" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 hover:text-glow">QR Codes</a>
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
                            <Button onClick={() => {
                                const newVerificationStatus = !isVerified;
                                setIsVerified(newVerificationStatus);
                                if (account) {
                                    verificationService.setBusinessVerified(account, newVerificationStatus);
                                    if (newVerificationStatus) {
                                        verificationService.setVerificationTimestamp(account);
                                    }
                                }
                            }} className="glow-button font-semibold text-white px-6 py-2 rounded-lg">
                                Toggle Verification Status
                            </Button>
                        </div>
                        {!businessData.isVerified && (
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
                                    <User className="w-6 h-6" />
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
                                    <Briefcase className="w-6 h-6" />
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
                                <Button onClick={handleTestTrustUpdate} className="mt-4 glow-button">Test Trust Update</Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="loans" ref={el => sectionsRef.current[1] = el} className="py-16 md:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="font-tech text-3xl md:text-4xl font-bold text-white text-glow">Quantum Lending Pool</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Access decentralized funding for your business growth.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="card-border-glow p-8 rounded-lg md:col-span-1">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/10 text-purple-400 mb-6">
                                    <Banknote className="w-6 h-6" />
                                </div>
                                <h3 className="font-tech text-xl font-bold text-white">Apply for Loan</h3>
                                <p className="mt-4 text-gray-400">Get access to community-funded Quantum Yield Pools for local growth.</p>
                                <Dialog open={isLoanApplicationOpen} onOpenChange={setIsLoanApplicationOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="glow-button font-semibold text-white px-8 py-3 rounded-lg mt-6" disabled={!businessData.isVerified}>Apply for a new loan</Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-black/80 backdrop-blur-md border border-purple-500/50 text-white">
                                        <DialogHeader>
                                            <DialogTitle className="font-tech text-2xl text-glow">Apply for a Loan</DialogTitle>
                                            <DialogDescription className="text-gray-400">
                                                Fill in the details to apply for a loan.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <LoanApplicationForm onSubmit={handleLoanSubmit} />
                                    </DialogContent>
                                </Dialog>
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

            <section id="nfts" ref={el => sectionsRef.current[1] = el} className="py-16 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-tech text-3xl md:text-4xl font-bold text-white text-glow">Coupon Campaigns</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Create and manage your promotional coupons.</p>
                    </div>
                    <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="card-border-glow p-8 rounded-lg md:col-span-1">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/10 text-purple-400 mb-6">
                                    <Ticket className="w-6 h-6" />
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

            <section id="nfts" ref={el => sectionsRef.current[1] = el} className="py-16 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-tech text-3xl md:text-4xl font-bold text-white text-glow">Payment QR Codes</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Generate QR codes for customers to pay with S.P.A.R.K.</p>
                    </div>

                    <QRCodeGenerator
                        businessId={currentBusiness?.businessAddress || businessData.name.toLowerCase().replace(/\s+/g, '-')}
                        businessName={businessData.name}
                        businessAddress={currentBusiness?.businessAddress}
                    />
                </div>
            </section>

            <section id="exchange" ref={el => sectionsRef.current[4] = el} className="py-16 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-tech text-3xl md:text-4xl font-bold text-white text-glow">Local Exchange</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Manage your company listing on the local exchange.</p>
                    </div>

                    {listings.length === 0 ? (
                        <div className="card-border-glow p-8 rounded-lg max-w-2xl mx-auto text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/10 text-purple-400 mb-6 mx-auto">
                                <Store className="w-6 h-6" />
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
                        <div className="card-border-glow p-8 rounded-lg">
                            <h3 className="font-tech text-xl font-bold text-white mb-6">Your Exchange Listings</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-800 hover:bg-transparent">
                                        <TableHead className="text-gray-400">Title</TableHead>
                                        <TableHead className="text-gray-400">Description</TableHead>
                                        <TableHead className="text-gray-400">Price</TableHead>
                                        <TableHead className="text-gray-400">Category</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listings.map((listing) => (
                                        <TableRow key={listing.companyName} className="border-gray-800 hover:bg-purple-500/5">
                                            <TableCell className="text-white">{listing.companyName}</TableCell>
                                            <TableCell className="text-white">{listing.companyName}</TableCell>
                                            <TableCell className="text-white">{listing.totalStocks}</TableCell>
                                            <TableCell className="text-white">{listing.companyName}</TableCell>

                                            <TableCell className="text-green-400">{listing.status}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </section>

            <section id="logout" className="py-16 md:py-20 text-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Button onClick={handleLogout} variant="outline" className="text-gray-300 border-gray-600 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </section>

            {/* Add the missing dialogs */}


            {/* Add missing import for Image icon */}
            <Dialog open={isNFTDialogOpen} onOpenChange={setIsNFTDialogOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md border border-purple-500/50 text-white">
                    <DialogHeader>
                        <DialogTitle className="font-tech text-2xl text-glow">Create New NFT</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Fill in the details to create a digital collectible.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleNFTSubmit} className="mt-4 grid grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="name" className="text-gray-400">NFT Name</Label>
                            <Input id="name" placeholder="e.g., Limited Edition Collectible" value={nftData.name} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description" className="text-gray-400">Description</Label>
                            <Textarea id="description" placeholder="Description of your NFT" value={nftData.description} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-gray-400">Price (USDT)</Label>
                            <Input id="price" type="number" placeholder="e.g., 10" value={nftData.price} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image" className="text-gray-400">Image URL</Label>
                            <Input id="image" placeholder="https://example.com/image.jpg" value={nftData.image} onChange={handleInputChange} className="bg-black/50 border-gray-700 text-white" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="metadata" className="text-gray-400">Metadata (JSON)</Label>
                            <Textarea id="metadata" rows={3} placeholder='{"attributes": [...]}' value={nftData.metadata} onChange={handleInputChange} className="bg-black/50 border-gray-700 text-white font-mono" />
                        </div>
                        <DialogFooter className="md:col-span-2">
                            <Button type="button" onClick={() => setIsNFTDialogOpen(false)} variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white">Cancel</Button>
                            <Button type="submit" className="glow-button font-semibold text-white px-4 py-2 rounded-lg">Create NFT</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={isListingDialogOpen} onOpenChange={setIsListingDialogOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md border border-purple-500/50 text-white">
                    <DialogHeader>
                        <DialogTitle className="font-tech text-2xl text-glow">Create New Listing</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Fill in the details to add a product to your catalog.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleListingSubmit} className="mt-4 grid grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="title" className="text-gray-400">Product Title</Label>
                            <Input id="title" placeholder="e.g., Handmade Leather Wallet" value={listingData.title} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description" className="text-gray-400">Description</Label>
                            <Textarea id="description" placeholder="Product description" value={listingData.description} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-gray-400">Price (USDT)</Label>
                            <Input id="price" type="number" placeholder="e.g., 25" value={listingData.price} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-gray-400">Category</Label>
                            <Input id="category" placeholder="e.g., Fashion, Electronics" value={listingData.category} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="image" className="text-gray-400">Image URL</Label>
                            <Input id="image" placeholder="https://example.com/product.jpg" value={listingData.image} onChange={handleInputChange} className="bg-black/50 border-gray-700 text-white" />
                        </div>
                        <DialogFooter className="md:col-span-2">
                            <Button type="button" onClick={() => setIsListingDialogOpen(false)} variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white">Cancel</Button>
                            <Button type="submit" className="glow-button font-semibold text-white px-4 py-2 rounded-lg">Create Listing</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={isQRCodeDialogOpen} onOpenChange={setIsQRCodeDialogOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md border border-purple-500/50 text-white">
                    <DialogHeader>
                        <DialogTitle className="font-tech text-2xl text-glow">Generate Payment QR Code</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Create a QR code for customers to scan and pay.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleQRCodeSubmit} className="mt-4 grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-gray-400">Amount</Label>
                            <Input id="amount" type="number" placeholder="e.g., 10" value={qrCodeData.amount} onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency" className="text-gray-400">Currency</Label>
                            <Select onValueChange={(value) => setQrCodeData({...qrCodeData, currency: value})} value={qrCodeData.currency}>
                                <SelectTrigger className="w-full bg-black/50 border-gray-700 text-white">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/80 border-gray-700 text-white">
                                    <SelectItem value="USDT">USDT</SelectItem>
                                    <SelectItem value="KAIA">KAIA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description" className="text-gray-400">Description</Label>
                            <Input id="description" placeholder="e.g., Payment for services" value={qrCodeData.description} onChange={handleInputChange} className="bg-black/50 border-gray-700 text-white" />
                        </div>
                        <DialogFooter className="md:col-span-2">
                            <Button type="button" onClick={() => setIsQRCodeDialogOpen(false)} variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white">Cancel</Button>
                            <Button type="submit" className="glow-button font-semibold text-white px-4 py-2 rounded-lg">Generate QR Code</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            </main>
        </div>
    );
};

export default BusinessDashboard;
