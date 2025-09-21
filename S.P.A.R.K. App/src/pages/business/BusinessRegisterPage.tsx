import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useSupabase } from "@/contexts/SupabaseContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const BusinessRegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, account, registerBusiness } = useWeb3();
  const { createBusiness } = useSupabase();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    pincode: "",
    country: "India",
    state: "",
    city: "",
    logo: null as File | null,
    termsAccepted: false
  });
  
  const [countries, setCountries] = useState(["India"]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (formData.pincode.length === 6) {
      axios
        .get(`https://api.postalpincode.in/pincode/${formData.pincode}`)
        .then((response) => {
          const data = response.data[0];
          if (data.Status === "Success") {
            const postOffice = data.PostOffice[0];
            setFormData(prev => ({
              ...prev,
              country: postOffice.Country,
              state: postOffice.State,
              city: postOffice.District
            }));
            const uniqueCities = [...new Set(data.PostOffice.map((po: any) => po.District))];
            setCities(uniqueCities as string[]);
          }
        })
        .catch((error) => {
          console.error("Error fetching pincode data:", error);
        });
    }
  }, [formData.pincode]);

  useEffect(() => {
    if (formData.country === "India") {
        const indianStates = [
            "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
            "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
            "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
            "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
            "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
            "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
        ];
        setStates(indianStates);
    } else {
        setStates([]);
    }
  }, [formData.country]);

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !account) {
      toast({
        title: "Blockchain Wallet Required",
        description: "S.P.A.R.K. requires blockchain authentication. Please connect your wallet.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Register business on Kaia blockchain
      const blockchainBusinessData = {
        name: formData.businessName,
        category: formData.category,
        location: `${formData.city}, ${formData.state}`,
        metadataURI: `ipfs://business-${Date.now()}` // In production, upload to IPFS
      };

      let txHash: string;
      try {
        txHash = await registerBusiness(blockchainBusinessData);
        console.log('✅ Business registered on blockchain:', txHash);
      } catch (contractError: any) {
        // Check if it's "already registered" error (check all possible error sources)
        const errorStr = JSON.stringify(contractError).toLowerCase();
        console.log('Contract error details:', contractError);
        
        if (errorStr.includes('business already registered') || 
            errorStr.includes('already registered')) {
          console.log('✅ Business already exists on blockchain, proceeding...');
          txHash = 'existing_blockchain_registration';
        } else {
          // For any other blockchain error, FAIL the registration
          console.error('❌ Blockchain registration failed:', contractError);
          throw new Error(`Blockchain registration required: ${contractError.message || 'Unknown blockchain error'}`);
        }
      }
      
      // Save to Supabase
      console.log('Saving business to database:', {
        name: formData.businessName,
        email: formData.email,
        wallet_address: account,
        transaction_hash: txHash
      });
      
      const businessData = {
        name: formData.businessName,
        category: formData.category,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        wallet_address: account,
        transaction_hash: txHash,
        status: 'pending_verification'
      };
      
      try {
        await createBusiness(businessData);
        console.log('✅ Business saved to database successfully');
      } catch (dbError: any) {
        console.error('❌ Database save failed:', dbError);
        console.error('Database error details:', JSON.stringify(dbError, null, 2));
        
        // Check if it's a duplicate error
        const errorMessage = dbError.message || JSON.stringify(dbError);
        if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
          throw new Error('Business already exists in database. Please try logging in instead.');
        }
        
        throw new Error(`Database registration failed: ${errorMessage}`);
      }

      toast({
        title: "Registration Successful!",
        description: "Your business has been registered. Redirecting to verification...",
      });

      setTimeout(() => {
        navigate('/business/verify');
      }, 2000);

    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering your business. Please try again.",
        variant: "destructive"
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
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/logo.svg" alt="S.P.A.R.K. Logo" width="40" />
                <span className="font-tech text-2xl font-bold tracking-wider text-white text-glow">S.P.A.R.K.</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Link to="/business/login" className="font-tech text-sm uppercase tracking-wider text-gray-400 hover:text-white">Login</Link>
              <Link to="/about" className="font-tech text-sm uppercase tracking-wider text-gray-400 hover:text-white">About</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="font-tech text-4xl md:text-5xl font-bold tracking-wider text-white text-glow">Join the Neural Commerce Protocol</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-400">Empower Your Business with Web3 Technology</p>
        </div>

        <Card className="max-w-4xl mx-auto bg-black/30 backdrop-blur-md border border-gray-800/50">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold text-white mb-6">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="business-name" className="text-gray-400">Business Name</Label>
                  <Input 
                    id="business-name" 
                    placeholder="Your Business Name" 
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="bg-gray-900/50 border-gray-800 text-white" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-category" className="text-gray-400">Business Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-md border-gray-800 text-white">
                      <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-gray-400">Contact Email</Label>
                  <Input 
                    id="contact-email" 
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
                    placeholder="Create a secure password" 
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="bg-gray-900/50 border-gray-800 text-white" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="text-gray-400">Contact Phone</Label>
                  <Input 
                    id="contact-phone" 
                    placeholder="Your Phone Number" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-gray-900/50 border-gray-800 text-white" 
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="business-address" className="text-gray-400">Business Address</Label>
                  <Input 
                    id="business-address" 
                    placeholder="123 Business St" 
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="bg-gray-900/50 border-gray-800 text-white" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-gray-400">Pincode</Label>
                  <Input 
                    id="pincode" 
                    placeholder="Enter your pincode" 
                    value={formData.pincode} 
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className="bg-gray-900/50 border-gray-800 text-white" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-gray-400">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-md border-gray-800 text-white">
                      {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-gray-400">State</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-md border-gray-800 text-white">
                      {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-400">City</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-md border-gray-800 text-white">
                      {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="logo" className="text-gray-400">Upload Logo (Optional)</Label>
                  <Input 
                    id="logo" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleInputChange('logo', e.target.files?.[0] || null)}
                    className="bg-gray-900/50 border-gray-800 text-white file:text-white file:bg-purple-600/50 file:border-0 file:hover:bg-purple-700/50" 
                  />
                </div>
              </div>
              
              {!isConnected && (
                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                  <p className="text-yellow-400 text-sm">Please connect your wallet to register a business.</p>
                </div>
              )}
              
              <div className="mt-6 flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange('termsAccepted', checked as boolean)}
                  className="border-gray-800 data-[state=checked]:bg-purple-600" 
                />
                <label htmlFor="terms" className="text-sm text-gray-400">
                  I agree to the <Link to="/terms" className="underline text-purple-400 hover:text-purple-300">Terms of Service</Link> and <Link to="/privacy" className="underline text-purple-400 hover:text-purple-300">Privacy Policy</Link>
                </label>
              </div>
              
              <Button 
                type="submit" 
                disabled={!isConnected || isLoading || !formData.termsAccepted}
                className="w-full mt-8 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold text-lg py-6"
              >
                {isLoading ? "Registering..." : "Create My S.P.A.R.K. Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BusinessRegisterPage;
