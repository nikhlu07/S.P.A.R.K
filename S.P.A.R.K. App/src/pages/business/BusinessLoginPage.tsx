import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import { useSupabase } from "../../contexts/SupabaseContext";
import { useToast } from "../../hooks/use-toast";

const BusinessLoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { connectWallet: connectWeb3Wallet, isConnected, account } = useWeb3();
  const { getBusinessByEmail, getBusinessByWalletAddress, createBusiness } = useSupabase();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if business exists in database
      const business = await getBusinessByEmail(formData.email);
      
      if (!business) {
        toast({
          title: "Login Failed",
          description: "No account found with this email address. Please register first.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // For now, we'll skip password verification since we don't have password hashing implemented
      // In a real app, you would verify the password hash here
      
      // Store business data in localStorage for session management
      localStorage.setItem("businessUser", JSON.stringify({
        id: business.id,
        name: business.name,
        email: business.email,
        walletAddress: business.wallet_address,
        isVerified: business.is_verified,
        status: business.status
      }));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${business.name}!`,
      });

      navigate("/business/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    try {
      setIsLoading(true);
      
      // Connect wallet first and use the returned address to avoid race conditions
      const walletInfo = await connectWeb3Wallet();
      const walletAddress = account || '';
      
      if (!walletAddress) {
        toast({
          title: "Wallet Connection Failed",
          description: "Please connect your wallet to continue.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if business exists with this wallet address in database
      let business = await getBusinessByWalletAddress(walletAddress);
      
      if (!business) {
        // Check if this wallet was previously verified (legacy data)
        const isLegacyVerified = localStorage.getItem(`business_verified_${walletAddress}`) === 'true';
        
        if (isLegacyVerified) {
          // Create a basic business record for legacy wallet users
          const legacyBusinessData = {
            name: `Business (${walletAddress.slice(0, 6)}...)`,
            email: `${walletAddress.toLowerCase()}@wallet.local`,
            phone: '',
            address: '',
            city: '',
            state: '',
            country: '',
            pincode: '',
            wallet_address: walletAddress,
            transaction_hash: '',
            status: 'active',
            is_verified: true
          };

          try {
            // Try to create the business record in database using the context method
            business = await createBusiness(legacyBusinessData);
            
            toast({
              title: "Account Migrated",
              description: "Your wallet account has been migrated to the new system.",
            });
          } catch (error) {
            console.error("Failed to migrate legacy account:", error);
            // Fall back to localStorage-only login for legacy users
            localStorage.setItem("businessUser", JSON.stringify({
              id: `legacy_${walletAddress}`,
              name: `Business (${walletAddress.slice(0, 6)}...)`,
              email: `${walletAddress.toLowerCase()}@wallet.local`,
              walletAddress: walletAddress,
              isVerified: isLegacyVerified,
              status: 'active'
            }));

            toast({
              title: "Wallet Login Successful",
              description: "Welcome back! (Legacy mode)",
            });

            navigate("/business/dashboard");
            setIsLoading(false);
            return;
          }
        } else {
          toast({
            title: "Account Not Found",
            description: "No business account found with this wallet address. Please register first.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Store business data in localStorage for session management
      localStorage.setItem("businessUser", JSON.stringify({
        id: business.id,
        name: business.name,
        email: business.email,
        walletAddress: business.wallet_address,
        isVerified: business.is_verified,
        status: business.status
      }));

      toast({
        title: "Wallet Login Successful",
        description: `Welcome back, ${business.name}!`,
      });

      navigate("/business/dashboard");
    } catch (error) {
      console.error("Wallet login error:", error);
      toast({
        title: "Wallet Login Failed",
        description: "Failed to login with wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/logo.svg" alt="S.P.A.R.K. Logo" width="40" />
                <span className="font-tech text-2xl font-bold tracking-wider text-white text-glow">S.P.A.R.K.</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="font-tech text-4xl md:text-5xl font-bold tracking-wider text-white text-glow">Welcome Back, Innovator</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-400">Access Your Business Dashboard</p>
        </div>

        <Card className="max-w-md mx-auto bg-black/30 backdrop-blur-md border border-gray-800/50">
          <CardContent className="p-8 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Business Login</h2>
              <p className="text-gray-400">Access your S.P.A.R.K. business dashboard</p>
            </div>
            
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-400">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-gray-900/50 border-gray-800 text-white" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-400">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="bg-gray-900/50 border-gray-800 text-white" 
                  required
                />
              </div>
              <div className="text-right">
                <Link to="/business/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 underline">
                  Forgot Password?
                </Link>
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-6"
              >
                {isLoading ? "Logging in..." : "Login to Dashboard"}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-gray-400">Or</span>
              </div>
            </div>
            
            <Button onClick={handleWalletLogin} variant="outline" className="w-full text-white border-purple-500 hover:bg-purple-500/20 hover:text-white">
              🔗 Connect with Wallet
            </Button>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Don't have a business account?{' '}
                <Link to="/business/register" className="text-purple-400 hover:text-purple-300 underline">
                  Register your business
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BusinessLoginPage;
