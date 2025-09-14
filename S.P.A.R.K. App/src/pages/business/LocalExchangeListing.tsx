
import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const LocalExchangeListing = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    taxId: '',
    incorporationDate: '',
    incorporationState: '',
    ownerName: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const mouseGlowRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // In a real application, you would handle file uploads and send data to a backend.
    console.log('Form Data:', formData);
    setIsSubmitted(true);
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
    document.body.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.body.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (isSubmitted) {
    return (
        <div className="flex flex-col min-h-screen antialiased">
            <div className="stars-container">
                <div className="star"></div><div className="star"></div><div className="star"></div><div className="star"></div><div className="star"></div>
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
                    </div>
                </div>
            </header>
            <main className="pt-20">
                <section className="relative hero-bg pt-12 pb-10 md:pt-16 md:pb-14">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="font-tech text-4xl md:text-6xl font-extrabold text-white tracking-tighter mt-4 text-glow">
                            Listing Submitted
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-400">
                            Your listing application has been submitted for approval. This process may take some time.
                        </p>
                        <Alert className="max-w-3xl mx-auto mt-6 border-yellow-500/50 text-yellow-500 bg-yellow-900/10">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Approval Pending</AlertTitle>
                            <AlertDescription>
                                You will be notified once your listing has been reviewed.
                                <Button asChild variant="link" className="p-0 h-auto ml-2 text-yellow-400 hover:text-yellow-300">
                                    <Link to="/business/dashboard">Return to Dashboard</Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    </div>
                </section>
            </main>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen antialiased">
        <div className="stars-container">
            <div className="star"></div><div className="star"></div><div className="star"></div><div className="star"></div><div className="star"></div>
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
                    <Link to="/business/dashboard" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 hover:text-glow">Dashboard</Link>
                </nav>
            </div>
        </div>
      </header>
      <main className="pt-20">
        <section className="relative hero-bg pt-12 pb-10 md:pt-16 md:pb-14">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="font-tech text-purple-400 text-sm mb-4 flex justify-center items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="status-light"></span>
                            <span>SYSTEM STATUS: OPERATIONAL</span>
                        </div>
                        <span>|</span>
                        <LiveClock />
                    </div>
                    <h1 className="font-tech text-4xl md:text-6xl font-extrabold text-white tracking-tighter mt-4 text-glow">
                        Local Exchange Listing Application
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-400">
                        Provide the following details to list your business on the local exchange.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto card-border-glow p-8 rounded-lg space-y-8">
                    
                    <div>
                        <h2 className="font-tech text-2xl font-bold text-white text-glow mb-4">Business Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="businessName" className="text-gray-400">Business Name</Label>
                                <Input id="businessName" placeholder="Your official business name" onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxId" className="text-gray-400">Tax ID / EIN</Label>
                                <Input id="taxId" placeholder="Your business tax identification number" onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                            </div>
                        </div>
                    </div>

                    
                    <div>
                        <h2 className="font-tech text-2xl font-bold text-white text-glow mb-4">Incorporation Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="incorporationDate" className="text-gray-400">Date of Incorporation</Label>
                                <Input id="incorporationDate" type="date" onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="incorporationState" className="text-gray-400">State of Incorporation</Label>
                                <Input id="incorporationState" placeholder="e.g., Delaware" onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="incorporationDocuments" className="text-gray-400">Incorporation Documents</Label>
                                <Input id="incorporationDocuments" type="file" required className="bg-black/50 border-gray-700 text-white" />
                                <p className="text-xs text-gray-400 mt-1">Please upload your certificate of incorporation.</p>
                            </div>
                        </div>
                    </div>

                    
                    <div>
                        <h2 className="font-tech text-2xl font-bold text-white text-glow mb-4">Owner Identification</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="ownerName" className="text-gray-400">Full Name of Owner</Label>
                                <Input id="ownerName" placeholder="John Doe" onChange={handleInputChange} required className="bg-black/50 border-gray-700 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ownerId" className="text-gray-400">Government-Issued ID</Label>
                                <Input id="ownerId" type="file" required className="bg-black/50 border-gray-700 text-white" />
                                <p className="text-xs text-gray-400 mt-1">Please upload a clear copy of your driver's license or passport.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 text-center">
                        <Button type="submit" className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full md:w-auto">Submit for Approval</Button>
                    </div>
                </form>
            </div>
        </section>
      </main>
    </div>
  );
};

export default LocalExchangeListing;
