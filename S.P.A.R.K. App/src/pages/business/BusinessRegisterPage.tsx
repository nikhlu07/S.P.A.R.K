import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const BusinessRegisterPage = () => {
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [countries, setCountries] = useState(["India"]); // Defaulting to India
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (pincode.length === 6) {
      axios
        .get(`https://api.postalpincode.in/pincode/${pincode}`)
        .then((response) => {
          const data = response.data[0];
          if (data.Status === "Success") {
            const postOffice = data.PostOffice[0];
            setCountry(postOffice.Country);
            setState(postOffice.State);
            const uniqueCities = [...new Set(data.PostOffice.map((po: any) => po.District))];
            setCities(uniqueCities as string[]);
            if (uniqueCities.length > 0) {
              setCity(uniqueCities[0] as string);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching pincode data:", error);
        });
    }
  }, [pincode]);

  // Fetch states for the selected country (if we were to support more countries)
  // For now, it's just India, so we can pre-populate or fetch states for India.
  useEffect(() => {
    // A real app would fetch this from an API
    if (country === "India") {
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
  }, [country]);


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
                <img src="/logo.png" alt="S.P.A.R.K. Logo" width="40" />
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
            <h2 className="text-2xl font-bold text-white mb-6">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="business-name" className="text-gray-400">Business Name</Label>
                <Input id="business-name" placeholder="Your Business Name" className="bg-gray-900/50 border-gray-800 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-category" className="text-gray-400">Business Category</Label>
                <Select>
                  <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-md border-gray-800 text-white">
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-gray-400">Contact Email</Label>
                <Input id="contact-email" type="email" placeholder="your@email.com" className="bg-gray-900/50 border-gray-800 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="text-gray-400">Contact Phone</Label>
                <Input id="contact-phone" placeholder="Your Phone Number" className="bg-gray-900/50 border-gray-800 text-white" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="business-address" className="text-gray-400">Business Address</Label>
                <Input id="business-address" placeholder="123 Business St" className="bg-gray-900/50 border-gray-800 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode" className="text-gray-400">Pincode</Label>
                <Input id="pincode" placeholder="Enter your pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="bg-gray-900/50 border-gray-800 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-400">Country</Label>
                <Select value={country} onValueChange={setCountry}>
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
                <Select value={state} onValueChange={setState}>
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
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-md border-gray-800 text-white">
                    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="logo" className="text-gray-400">Upload Logo</Label>
                <Input id="logo" type="file" className="bg-gray-900/50 border-gray-800 text-white file:text-white file:bg-purple-600/50 file:border-0 file:hover:bg-purple-700/50" />
              </div>
            </div>
            <div className="mt-6 flex items-center space-x-2">
              <Checkbox id="terms" className="border-gray-800 data-[state=checked]:bg-purple-600" />
              <label htmlFor="terms" className="text-sm text-gray-400">I agree to the <Link to="/terms" className="underline text-purple-400 hover:text-purple-300">Terms of Service</Link> and <Link to="/privacy" className="underline text-purple-400 hover:text-purple-300">Privacy Policy</Link></label>
            </div>
            <Button type="submit" className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-6">Create My S.P.A.R.K. Account</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BusinessRegisterPage;
