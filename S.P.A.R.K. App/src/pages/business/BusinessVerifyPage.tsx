import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Upload, FileText, Shield, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/contexts/Web3Context";
import { useSupabase } from "@/contexts/SupabaseContext";
import { verificationService } from "@/services/verificationService";

const BusinessVerifyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { account, refreshBalances } = useWeb3();
  const { refreshAll } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formData, setFormData] = useState({
    businessLicense: null as File | null,
    taxDocument: null as File | null,
    addressProof: null as File | null,
    ownerIdProof: null as File | null,
    businessDescription: '',
    additionalInfo: ''
  });

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateVerificationStatus = async () => {
    try {
      console.log('🔄 Updating verification status...');
      
      if (!account) {
        throw new Error('No wallet connected');
      }
      
      // Update verification status using the service
      verificationService.setBusinessVerified(account, true);
      verificationService.setVerificationTimestamp(account);
      
      // Update blockchain verification status (simulated for demo)
      console.log('✅ Blockchain verification updated for:', account);
      
      // Update database verification status (simulated for demo)
      console.log('✅ Database verification updated');
      
      // Refresh all data to reflect changes
      await refreshBalances();
      await refreshAll();
      
      console.log('🎉 Verification status updated successfully!');
      
    } catch (error) {
      console.error('❌ Failed to update verification status:', error);
      throw error;
    }
  };

  const handleSubmitDocuments = async () => {
    setIsLoading(true);
    
    try {
      // Simulate document upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVerificationStep(2);
      
      toast({
        title: "Documents Submitted!",
        description: "Your verification documents have been submitted for review.",
      });

      // Start auto-verification countdown for demo
      setIsAutoVerifying(true);
      setCountdown(5);
      
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verification countdown effect
  useEffect(() => {
    if (isAutoVerifying && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isAutoVerifying && countdown === 0) {
      // Auto-verify after countdown
      const performVerification = async () => {
        try {
          await updateVerificationStatus();
          setVerificationStep(3);
          toast({
            title: "🎉 Business Verified!",
            description: "Your business has been automatically verified for demo purposes!",
          });
        } catch (error) {
          console.error('Verification failed:', error);
          toast({
            title: "Verification Failed",
            description: "There was an error during verification. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      performVerification();
    }
  }, [isAutoVerifying, countdown, toast]);

  const requiredDocuments = [
    {
      field: 'businessLicense',
      label: 'Business License',
      description: 'Valid business registration certificate',
      required: true
    },
    {
      field: 'taxDocument',
      label: 'Tax Document',
      description: 'GST certificate or tax registration',
      required: true
    },
    {
      field: 'addressProof',
      label: 'Address Proof',
      description: 'Utility bill or lease agreement',
      required: true
    },
    {
      field: 'ownerIdProof',
      label: 'Owner ID Proof',
      description: 'Aadhar card, PAN card, or passport',
      required: true
    }
  ];

  if (verificationStep === 3) {
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
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h1 className="font-tech text-4xl font-bold text-white text-glow mb-4">
                🎉 Business Verified!
              </h1>
              <p className="text-lg text-gray-400">
                Congratulations! Your business has been successfully verified and is now active on S.P.A.R.K.
              </p>
            </div>

            <Card className="bg-black/30 backdrop-blur-md border border-green-500/50 mb-8">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-green-600/20 text-green-400 px-4 py-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verified Business
                    </Badge>
                  </div>

                  <div className="text-left space-y-4">
                    <h3 className="text-xl font-bold text-white">You can now:</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">💳 Accept Payments</h4>
                        <p className="text-gray-400 text-sm">Generate QR codes and accept crypto payments</p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">🎯 Create Deals</h4>
                        <p className="text-gray-400 text-sm">Launch promotional campaigns and NFT coupons</p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">📊 Analytics</h4>
                        <p className="text-gray-400 text-sm">Track sales, customers, and performance</p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">🤝 Community</h4>
                        <p className="text-gray-400 text-sm">Connect with customers and other businesses</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('/business/dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="text-white border-gray-600 px-8 py-3"
              >
                Explore S.P.A.R.K.
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (verificationStep === 2) {
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
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="font-tech text-4xl font-bold text-white text-glow mb-4">
                Verification Submitted
              </h1>
              <p className="text-lg text-gray-400">
                Your business verification documents have been submitted successfully.
              </p>
            </div>

            <Card className="bg-black/30 backdrop-blur-md border border-gray-800/50 mb-8">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    {isAutoVerifying ? (
                      <Badge className="bg-blue-600/20 text-blue-400 px-4 py-2">
                        <Clock className="w-4 h-4 mr-2" />
                        Auto-verifying in {countdown}s...
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-600/20 text-yellow-400 px-4 py-2">
                        <Clock className="w-4 h-4 mr-2" />
                        Under Review
                      </Badge>
                    )}
                  </div>

                  <div className="text-left space-y-4">
                    <h3 className="text-xl font-bold text-white">What happens next?</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                        <div>
                          <p className="text-white font-medium">Document Review</p>
                          <p className="text-gray-400 text-sm">Our team will verify your submitted documents (1-2 business days)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                        <div>
                          <p className="text-white font-medium">Business Verification</p>
                          <p className="text-gray-400 text-sm">We may contact you for additional information if needed</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                        <div>
                          <p className="text-white font-medium">Account Activation</p>
                          <p className="text-gray-400 text-sm">Once approved, you'll get full access to all business features</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">While you wait:</h4>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>• Set up your business profile</li>
                      <li>• Create your first promotional deals</li>
                      <li>• Generate QR codes for payments</li>
                      <li>• Explore the business dashboard</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('/business/dashboard')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="text-white border-gray-600 px-8 py-3"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="font-tech text-4xl md:text-5xl font-bold tracking-wider text-white text-glow">
            Business Verification
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-400">
            Complete your verification to unlock all S.P.A.R.K. features
          </p>
        </div>

        <Card className="max-w-4xl mx-auto bg-black/30 backdrop-blur-md border border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Upload Verification Documents
            </CardTitle>
            <p className="text-gray-400">
              Please upload the following documents to verify your business
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {requiredDocuments.map((doc) => (
                <div key={doc.field} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-400 font-medium">
                      {doc.label}
                      {doc.required && <span className="text-red-400 ml-1">*</span>}
                    </Label>
                    {formData[doc.field as keyof typeof formData] && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{doc.description}</p>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(doc.field, e.target.files?.[0] || null)}
                      className="bg-gray-900/50 border-gray-800 text-white file:text-white file:bg-purple-600/50 file:border-0 file:hover:bg-purple-700/50"
                    />
                    <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {formData[doc.field as keyof typeof formData] && (
                    <p className="text-sm text-green-400">
                      ✓ {(formData[doc.field as keyof typeof formData] as File)?.name}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Business Description</Label>
                <Textarea
                  placeholder="Describe your business, products, and services..."
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  className="bg-gray-900/50 border-gray-800 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Additional Information (Optional)</Label>
                <Textarea
                  placeholder="Any additional information that might help with verification..."
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  className="bg-gray-900/50 border-gray-800 text-white"
                />
              </div>
            </div>

            <div className="mt-8 bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-medium">Demo Requirements</h4>
                  <ul className="text-blue-300 text-sm mt-2 space-y-1">
                    <li>• Upload any business document for demo</li>
                    <li>• Accepted formats: PDF, JPG, PNG (max 5MB)</li>
                    <li>• This is a simplified verification for demonstration</li>
                    <li>• Full verification will be implemented later</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                onClick={() => navigate('/business/dashboard')}
                variant="outline"
                className="flex-1 text-white border-gray-600"
              >
                Skip for Now
              </Button>
              <Button
                onClick={handleSubmitDocuments}
                disabled={isLoading || !requiredDocuments.every(doc => formData[doc.field as keyof typeof formData])}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BusinessVerifyPage;