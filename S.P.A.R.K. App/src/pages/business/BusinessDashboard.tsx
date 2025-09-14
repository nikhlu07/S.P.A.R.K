import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Bell, Terminal, Banknote, Ticket, Store } from 'lucide-react';

const BusinessDashboard = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [time, setTime] = useState('');
  const mouseGlowRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      setTime(now.toLocaleTimeString('en-US', options).replace(' ', '') + ' IST');
    };
    const timerId = setInterval(updateTime, 1000);
    updateTime();

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
      clearInterval(timerId);
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
                    <span id="live-time">{time}</span>
                </div>
                <h1 className="font-tech text-4xl md:text-6xl font-extrabold text-white tracking-tighter mt-4 text-glow">
                    Business Dashboard
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-400">
                    Manage your SPARK assets and operations.
                </p>
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

        <section id="loans" ref={el => sectionsRef.current[0] = el} className="py-16 md:py-20">
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
                        <Button className="glow-button font-semibold text-white px-8 py-3 rounded-lg mt-6" disabled={!isVerified}>Apply for a new loan</Button>
                    </div>
                    <div className="card-border-glow p-8 rounded-lg md:col-span-2">
                        <h3 className="font-tech text-xl font-bold text-white mb-4">Existing Loans</h3>
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-transparent">
                              <TableHead className="text-gray-400">Loan ID</TableHead>
                              <TableHead className="text-gray-400">Amount</TableHead>
                              <TableHead className="text-gray-400">Status</TableHead>
                              <TableHead className="text-gray-400">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-gray-800 hover:bg-purple-500/5">
                              <TableCell className="text-white font-tech">L001</TableCell>
                              <TableCell className="text-white">$10,000</TableCell>
                              <TableCell className="text-green-400">Approved</TableCell>
                              <TableCell className="text-white">2023-01-15</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </section>

        <section id="coupons" ref={el => sectionsRef.current[1] = el} className="py-16 md:py-20">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-tech text-3xl md:text-4xl font-bold text-white text-glow">Coupon Campaigns</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Create and manage your promotional coupons.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="card-border-glow p-8 rounded-lg md:col-span-1">
                         <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/10 text-purple-400 mb-6">
                            <Ticket className="w-6 h-6"/>
                        </div>
                        <h3 className="font-tech text-xl font-bold text-white">Create Coupon</h3>
                        <p className="mt-4 text-gray-400">Generate viral, self-replicating NFT coupon campaigns.</p>
                        <Button className="glow-button font-semibold text-white px-8 py-3 rounded-lg mt-6">Create a new coupon</Button>
                    </div>
                    <div className="card-border-glow p-8 rounded-lg md:col-span-2">
                        <h3 className="font-tech text-xl font-bold text-white mb-4">Existing Coupons</h3>
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-transparent">
                              <TableHead className="text-gray-400">Coupon Code</TableHead>
                              <TableHead className="text-gray-400">Discount</TableHead>
                              <TableHead className="text-gray-400">Status</TableHead>
                              <TableHead className="text-gray-400">Expiry Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-gray-800 hover:bg-purple-500/5">
                              <TableCell className="text-white font-tech">SUMMER25</TableCell>
                              <TableCell className="text-white">25%</TableCell>
                              <TableCell className="text-green-400">Active</TableCell>
                              <TableCell className="text-white">2024-08-31</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </section>

        <section id="exchange" ref={el => sectionsRef.current[2] = el} className="py-16 md:py-20">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-tech text-3xl md:text-4xl font-bold text-white text-glow">Local Exchange</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">List items in the local exchange.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="card-border-glow p-8 rounded-lg md:col-span-1">
                         <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/10 text-purple-400 mb-6">
                            <Store className="w-6 h-6"/>
                        </div>
                        <h3 className="font-tech text-xl font-bold text-white">Create Listing</h3>
                        <p className="mt-4 text-gray-400">Engage in hyper-local commerce and trade with your community.</p>
                        <Button className="glow-button font-semibold text-white px-8 py-3 rounded-lg mt-6" disabled={!isVerified}>Create a new listing</Button>
                    </div>
                    <div className="card-border-glow p-8 rounded-lg md:col-span-2">
                        <h3 className="font-tech text-xl font-bold text-white mb-4">Your Listings</h3>
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-transparent">
                              <TableHead className="text-gray-400">Item</TableHead>
                              <TableHead className="text-gray-400">Price</TableHead>
                              <TableHead className="text-gray-400">Status</TableHead>
                              <TableHead className="text-gray-400">Date Listed</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-gray-800 hover:bg-purple-500/5">
                              <TableCell className="text-white">Handmade Goods</TableCell>
                              <TableCell className="text-white">$50</TableCell>
                              <TableCell className="text-green-400">Listed</TableCell>
                              <TableCell className="text-white">2024-05-20</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default BusinessDashboard;
