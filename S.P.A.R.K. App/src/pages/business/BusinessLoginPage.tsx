import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useOutletContext } from "react-router-dom";
import { AppContext } from "@/components/layout/MainLayout";

const BusinessLoginPage = () => {
  const { connectWallet } = useOutletContext<AppContext>();

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
                <img src="/logo.png" alt="S.P.A.R.K. Logo" width="40" />
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
            <Button onClick={connectWallet} variant="outline" className="w-full text-white border-purple-500 hover:bg-purple-500/20 hover:text-white font-bold text-lg py-6">
              Login with Wallet
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-400">Email Address</Label>
              <Input id="email" type="email" placeholder="your@email.com" className="bg-gray-900/50 border-gray-800 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-400">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="bg-gray-900/50 border-gray-800 text-white" />
            </div>
            <div className="text-right">
                <Link to="/business/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 underline">
                    Forgot Password?
                </Link>
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-6">Login</Button>
            <div className="text-center text-gray-400">
              Don't have an account? <Link to="/business/register" className="font-bold text-purple-400 hover:text-purple-300 underline">Register Now</Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BusinessLoginPage;
